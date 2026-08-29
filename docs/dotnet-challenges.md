# .NET Engineering & Architecture Challenges Standard

## Purpose & Overview

Dokumen ini mendokumentasikan kumpulan **Tantangan Rekayasa, Masalah Kinerja, dan Jebakan Arsitektur (Pitfalls)** yang paling sering dihadapi dalam pengembangan sistem backend berbasis **.NET (C# / ASP.NET Core)** tingkat produksi (*enterprise-scale*), beserta panduan mitigasi, *root cause analysis*, dan implementasi kode *best practice*.

Standar ini dirancang sebagai referensi teknis bagi developer, tech lead, dan software architect untuk mencegah kesalahan berulang (*anti-patterns*), menjaga *throughput* sistem, serta menjamin stabilitas aplikasi di lingkungan *cloud* maupun *containerized (Docker / Kubernetes)*.

---

## 1. Concurrency, Asynchronous & ThreadPool Starvation

### 1.1 Sync-over-Async & ThreadPool Starvation
- **Masalah**: Menggunakan `.Result`, `.Wait()`, atau `.GetAwaiter().GetResult()` pada `Task` di dalam controller atau service.
- **Dampak**: *Deadlock* (pada lingkungan dengan `SynchronizationContext`) atau *ThreadPool Starvation* di mana seluruh thread worker habis menunggu IO task selesai, menyebabkan HTTP request baru mengalami *timeout* (HTTP 503 / 504).
- **Solusi**: Gunakan `async`/`await` secara *end-to-end* (dari Controller hingga Database Driver).

### 1.2 Bahaya `async void`
- **Masalah**: Menggunakan `async void` selain pada *Event Handler* UI.
- **Dampak**: Exception yang dilempar tidak dapat ditangkap oleh `try-catch` caller dan langsung menyebabkan *process crash* (Unhandled AppDomain Exception).
- **Solusi**: Selalu gunakan `async Task` atau `async Task<T>`.

### 1.3 Propagasi `CancellationToken`
- **Masalah**: Mengabaikan `CancellationToken` dari `HttpContext.RequestAborted`.
- **Dampak**: Backend tetap menjalankan query SQL berat atau proses komputasi meskipun user / client sudah membatalkan request atau menutup browser.
- **Solusi**: Teruskan `CancellationToken` ke semua operasi async (EF Core, HTTP Client, Redis, MassTransit).

### 1.4 `ValueTask` vs `Task` Allocation
- **Masalah**: Menggunakan `Task<T>` untuk metode yang sering menyelesaikan eksekusi secara sinkron (misal: *in-memory cache hit*).
- **Dampak**: Alokasi objek `Task` berulang di *Managed Heap* yang membebani Garbage Collector.
- **Solusi**: Gunakan `ValueTask<T>` untuk jalur eksekusi yang sering mengembalikan nilai langsung tanpa alokasi heap.

---

## 2. Entity Framework Core Performance & Concurrency

### 2.1 N+1 Query & Cartesian Explosion
- **Masalah**: Melakukan iterasi relasi entitas tanpa `Include` (N+1 query) atau melakukan multiple `Include` relasi *collection* tanpa split query yang menghasilkan jutaan baris duplikat di memori (*Cartesian Explosion*).
- **Solusi**: Gunakan `AsNoTracking()`, `AsSplitQuery()`, dan proyeksi `Select(dto => ...)` untuk menghindari *over-fetching*.

### 2.2 DbContext Thread-Safety & Lifetime Violation
- **Masalah**: Menggunakan instance `DbContext` yang sama secara konkuren di beberapa thread (misal dalam `Task.WhenAll` atau *Singleton BackgroundService*).
- **Dampak**: `InvalidOperationException: A second operation was started on this context instance before a previous operation completed.` atau data corruption.
- **Solusi**: Gunakan `IDbContextFactory<AppDbContext>` atau buat `IServiceScope` baru untuk setiap thread/background task.

### 2.3 DbContext Pooling & Memory Overhead
- **Masalah**: Instansiasi `DbContext` berulang-ulang pada aplikasi dengan ribuan RPS.
- **Solusi**: Gunakan `services.AddDbContextPool<AppDbContext>()` untuk me-reuse instance `DbContext` dan mengurangi alokasi GC.

### 2.4 Batch Operations (Bulk Update/Delete)
- **Masalah**: Mengambil ribuan data ke memori (`ToList()`), memodifikasi property, lalu memanggil `SaveChangesAsync()`.
- **Solusi**: Gunakan `ExecuteUpdateAsync()` dan `ExecuteDeleteAsync()` (tersedia sejak .NET 7+) untuk mengeksekusi SQL update/delete langsung di database tanpa memuat entitas ke Change Tracker.

---

## 3. Memory Management, Garbage Collection & High Throughput

### 3.1 Large Object Heap (LOH) Fragmentation
- **Masalah**: Mengalokasikan array byte atau string berukuran $\ge$ 85.000 byte secara berulang (misal saat membaca file upload, PDF stream, atau serialisasi JSON besar).
- **Dampak**: Memori proses terus membengkak karena GC Gen 2 / LOH sulit didefragmentasi, berujung pada *Out Of Memory (OOM)*.
- **Solusi**: Gunakan `ArrayPool<byte>.Shared` atau `MemoryStream` berbasis *RecyclableMemoryStreamManager*.

### 3.2 Alokasi String & Substring Berlebih
- **Masalah**: Melakukan manipulasi string intensif menggunakan `string.Split`, `Substring`, atau konkatenasi `+` di dalam loop.
- **Solusi**: Gunakan `ReadOnlySpan<char>`, `Span<T>`, dan `string.Create()` / `StringBuilder` untuk operasi *zero-allocation parsing*.

### 3.3 Server GC vs Workstation GC di Docker / Kubernetes
- **Masalah**: Menggunakan default Workstation GC pada container dengan multi-core CPU, atau Server GC dengan memori terbatas sehingga GC tidak agresif membersihkan heap dan terkena *OOMKilled* oleh Kubernetes.
- **Solusi**: Konfigurasikan `DOTNET_gcServer=1`, `DOTNET_GCHeapHardLimitPercent=75` pada environment Docker / Helm chart.

---

## 4. Distributed Systems, Messaging & Event Consistency

### 4.1 Dual-Write & Inconsistent State
- **Masalah**: Menyimpan data ke Database (SQL) lalu mempublikasikan event ke RabbitMQ / Kafka secara terpisah. Jika salah satu gagal di tengah jalan, sistem berada dalam kondisi tidak konsisten.
- **Solusi**: Terapkan **Transactional Outbox Pattern** menggunakan MassTransit Outbox atau tabel Outbox kustom dengan *background worker*.

### 4.2 Idempotent Consumer & At-Least-Once Delivery
- **Masalah**: Message broker mengirimkan ulang pesan (*retry/redelivery*), menyebabkan operasi bisnis (misal pemotongan saldo atau pembuatan invoice) tereksekusi dua kali.
- **Solusi**: Simpan `MessageId` / `EventId` ke tabel `ProcessedMessages` dalam transaksi database sebelum memproses payload.

### 4.3 Poison Message & Dead Letter Handling
- **Masalah**: Pesan rusak (*malformed payload*) menyebabkan worker crash berulang-ulang dalam *infinite retry loop*.
- **Solusi**: Pasang mekanisme Circuit Breaker & Dead Letter Queue (DLQ) dengan kebijakan retry bertingkat (exponential backoff).

---

## 5. Resiliency, Caching & Microservices

### 5.1 Cache Stampede (Dogpiling) & Redis Latency
- **Masalah**: Saat cache ber-TTL kedaluwarsa, ratusan request konkuren langsung menghantam database secara bersamaan untuk query yang sama.
- **Solusi**: Gunakan .NET 9 `HybridCache` atau kunci terdistribusi (*distributed locking / SemaphoreSlim*) untuk membatasi eksekusi query ke database hanya satu kali (*single flight*).

### 5.2 HttpClient Socket Exhaustion & DNS TTL
- **Masalah**: Menginstansiasi `new HttpClient()` per request (menyebabkan *Socket Exhaustion*) atau menggunakan `HttpClient` Singleton tanpa me-refresh DNS saat IP upstream berubah.
- **Solusi**: Gunakan `IHttpClientFactory` (`services.AddHttpClient(...)`) dengan lifetime socket terkonfigurasi (`SetHandlerLifetime(TimeSpan.FromMinutes(5))`).

### 5.3 Resiliency Pipelines dengan Polly v8
- **Masalah**: Layanan pihak ketiga (*third-party payment gateway / ERP*) mengalami *transient failure* atau penurunan performa drastis.
- **Solusi**: Terapkan `ResiliencePipeline` dari Polly v8 yang mengombinasikan Timeout, Retry dengan Jitter, dan Circuit Breaker.

---

## 6. Security, Authentication & Multi-Instance Scaling

### 6.1 ASP.NET Core Data Protection Key Mismatch
- **Masalah**: Pada deployment multi-pod Kubernetes / Docker swarm, enkripsi cookie auth atau anti-forgery token gagal didekripsi jika pod lain menerima request berikutnya karena key tersimpan di filesystem lokal pod.
- **Solusi**: Konfigurasikan `AddDataProtection().PersistKeysToDbContext()` atau `PersistKeysToStackExchangeRedis()` dengan KMS / Azure Key Vault.

### 6.2 Token Expiry Race Condition
- **Masalah**: Multiple concurrent API call dengan access token yang hampir habis secara simultan meminta token refresh, menyebabkan invalidasi refresh token yang belum sempat dipakai.
- **Solusi**: Gunakan locking berbasis user di client / gateway atau sediakan *grace period* 30 detik untuk token refresh reuse.

---

## 7. High-Throughput Structured Logging & Observability

### 7.1 Serilog Sink Blocking
- **Masalah**: Menulis log ke database / Elasticsearch secara sinkron dalam request pipeline utama.
- **Solusi**: Selalu bungkus sink log dengan `WriteTo.Async(...)` menggunakan buffer terdistribusi agar logging tidak menambah latensi API.

### 7.2 OpenTelemetry & Distributed Tracing
- **Masalah**: Sulit mendiagnosis bottleneck antar service mikro tanpa korelasi ID yang seragam.
- **Solusi**: Gunakan `System.Diagnostics.ActivitySource` dan OpenTelemetry .NET SDK untuk mengekspor trace & span ke Jaeger / Grafana Tempo.

---

## 8. Clean Architecture & Domain Modeling Trade-offs

### 8.1 Anemic Domain Model vs Rich Domain Model
- **Masalah**: Entitas Domain hanya berisi property `get; set;` publik tanpa validasi status, sehingga aturan bisnis tercecer di berbagai controller / handler.
- **Solusi**: Jadikan setter private, buat constructor eksplisit, dan sediakan metode mutasi domain yang menjamin *invariants* selalu valid.

### 8.2 MediatR Over-Engineering
- **Masalah**: Menggunakan MediatR untuk setiap method CRUD sederhana yang hanya meneruskan request ke repository tanpa ada cross-cutting concern.
- **Solusi**: Gunakan direct method call untuk pipeline sederhana; gunakan MediatR / FastEndpoints saat membutuhkan *pipeline behaviors* terpusat (Validation, Caching, Logging).

---

## Matriks Ringkasan Tantangan

| Kategori | Tantangan Kunci | Severity | Rekomendasi Solusi |
| :--- | :--- | :--- | :--- |
| **Concurrency** | Sync-over-Async (.Result / .Wait) | 🔴 CRITICAL | Async/Await end-to-end, SemaphoreSlim |
| **Data Access** | EF Core N+1 & Cartesian Explosion | 🔴 CRITICAL | AsNoTracking, AsSplitQuery, Dapper Hybrid |
| **Data Access** | DbContext Multi-Threading Violation | 🔴 CRITICAL | IDbContextFactory / Scoped Lifetime |
| **Memory / GC** | Large Object Heap (LOH) Fragmentation | 🟡 HIGH | ArrayPool\<T\>, RecyclableMemoryStream |
| **Messaging** | Dual-Write Inconsistency | 🔴 CRITICAL | Transactional Outbox Pattern |
| **Resiliency** | Cache Stampede pada High Traffic | 🟡 HIGH | HybridCache / Single-flight locking |
| **Networking** | HttpClient Socket Exhaustion | 🟡 HIGH | IHttpClientFactory + Pooled Connection |
| **Security** | Data Protection Key Desynchronization | 🔴 CRITICAL | Shared Redis / Database Key Storage |
| **Observability**| Serilog Sink Blocking I/O | 🟢 MEDIUM | WriteTo.Async + Structured JSON |
| **Architecture** | Anemic Domain Model | 🟢 MEDIUM | Encapsulated Entity Methods & Invariants |
