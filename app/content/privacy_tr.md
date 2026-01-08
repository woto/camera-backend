# VolleyCam Gizlilik Politikası

**Son güncelleme:** 5 Ocak 2026.

## 1. Genel Bakış
VolleyCam, Android uygulamasını ve `volleycam.com` adresindeki VolleyCam web sitesini içerir. Uygulama, “dashcam” benzeri bir tampon mekanizmasıyla voleybol maçlarını kaydeder ve web sitesi kayıtları görüntülemeye ve yönetmeye olanak tanır. Kullanıcılar, klipleri bir oyun oturumuna bağlamak için 6 haneli bir kodla belirli bir “oda”ya katılır.

## 2. Topladığımız bilgiler

### 2.1. Video ve ses verileri
- **Ne topluyoruz:** Uygulama, voleybol maçlarının video ve sesini kaydetmek için cihazınızın Kamera ve Mikrofonuna erişir.
- **Nasıl kullanılır:** Uygulama videoyu bellekte sürekli tamponlar. Yalnızca bir “tetikleme” olayı (kullanıcının bir cep telefonundan veya oda kodunu kullanarak web sitesinden başlattığı) gerçekleştiğinde ilgili bölüm (video ve ses) kalıcı olarak kaydedilir ve sunucularımıza (`volleycam.com`) yüklenir.
- **Arka plan kullanımı:** Uygulama, uzun maçlar sırasında (genellikle 3 saat) pil tasarrufu için ekran kapalıyken de kayda devam eder.

### 2.2. Oda kimliği
- **Ne topluyoruz:** Kullanıcıların oyun oturumu için serbestçe oluşturduğu 6 haneli bir Oda Kimliği.
- **Nasıl kullanılır:** Yüklenen klipleri belirli bir oyun oturumuna bağlamak ve web sitesinde erişimi kontrol etmek için.

### 2.3. Web sitesi kullanım verileri
- **Ne topluyoruz:** IP adresi, tarayıcı türü ve ziyaret edilen sayfalar gibi standart web günlük verileri. Web sitesi ayrıca oturumunuzu açık tutmak, dil tercihinizi hatırlamak ve mevcut oda seçiminizi korumak için çerezler kullanır.
- **Nasıl kullanılır:** Web sitesini işletmek, kayıtlara erişimi güvence altına almak ve istenen sayfalar ile özellikleri sağlamak için.

### 2.4. Cihaz kimliği
- **Ne topluyoruz:** cihazda saklanan teknik bir cihaz kimliği (rastgele UUID).
- **Nasıl kullanılır:** benzersiz dosya adları oluşturmak ve yüklemeleri sunucuda doğru şekilde işlemek için.

## 3. Veri paylaşımı ve aktarımı
- **Sunucuya yükleme:** Kaydedilen klipler güvenli sunucumuz `volleycam.com` üzerine yüklenir.
- **Şifreleme:** Tüm veri aktarımı standart HTTPS/WSS protokolleriyle şifrelenir.
- **Herkese açık görünürlük:**
    - Oda Kimliği ile ilişkilendirilen kliplere, geçerli 6 haneli koda sahip olan herkes erişebilir.
    - **Önemli:** Bir klip “yayınlandıktan” veya yüklendikten sonra, web sitesi üzerinden doğru bağlantı veya Oda Kimliğine sahip herhangi bir internet kullanıcısı tarafından herkese açık şekilde erişilebilir olabilir. Bu hizmeti özel veya hassas anları kaydetmek için kullanmayın.

## 4. Saklama süresi
Yüklenen klipler kullanıcı tarafından silinene kadar süresiz olarak saklanır. Kullanıcılar oda kimliğini biliyorlarsa klipleri web sitesi üzerinden silebilir. Silme talebi için site yöneticisiyle de iletişime geçebilirsiniz. Bazı durumlarda klipler yönetici takdirine bağlı olarak kaldırılabilir. Cihaz belleğindeki tampon kayıtlar tetikleme gönderilmedikçe kaydedilmez.

## 5. Kullanıcı hakları ve kontrolü
- **Yükleme:** Uygulamanın ne zaman aktif olup kayıt yaptığını siz kontrol edersiniz.
- **Silme:** Oda Kimliğine erişimi olan kullanıcılar VolleyCam web sitesi üzerinden klipleri silebilir. Ayrıca destekle iletişime geçerek silme talep edebilirsiniz.
- **Bildirim:** Uygunsuz içeriği web sitesi üzerinden bildirebilirsiniz.

### Yüklenen videoyu nasıl silebilirim
1. `volleycam.com` adresini açın ve yan menüdeki “Oda” öğesinden doğru odayı seçin (doğru 6 haneli kod gerekir).
2. İstediğiniz etkinliği açın.
3. Etkinlik başlığındaki çöp kutusu simgesine tıklayın ve silmeyi onaylayın.

## 6. İletişim
Bu gizlilik politikası hakkında sorularınız varsa lütfen şu adresten bize ulaşın: oganer@gmail.com
