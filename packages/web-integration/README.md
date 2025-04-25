# @acabai/web

Web tarayıcı otomasyonu için AI destekli araçlar sunan bir JavaScript/TypeScript kütüphanesi.

## Özellikler

- **AI Destekli Otomasyon**: Doğal dil komutlarıyla web tarayıcılarını kontrol edin
- **Puppeteer ve Playwright Desteği**: Popüler otomasyon araçlarıyla entegrasyon
- **Chrome Uzantısı**: Tarayıcı içi otomasyon için Chrome uzantısı
- **Puppeteer-Extra Entegrasyonu**: Stealth modu ve reklam engelleme özellikleri
- **YAML Desteği**: Otomasyon görevlerini YAML dosyalarıyla tanımlayın
- **Metadata Çıkarma**: AI görevlerinden detaylı metadata alın

## Kurulum

```bash
npm install @acabai/web
```

Puppeteer-extra özelliklerini kullanmak için ek paketleri yüklemeniz gerekir:

```bash
npm install puppeteer-extra puppeteer-extra-plugin-stealth puppeteer-extra-plugin-adblocker
```

## Hızlı Başlangıç

### Puppeteer ile Kullanım

```javascript
import { PuppeteerAgent } from '@acabai/web';
import puppeteer from 'puppeteer';

async function run() {
  // Tarayıcıyı başlat
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Agent'ı oluştur
  const agent = new PuppeteerAgent(page);

  // AI komutlarını çalıştır
  const result = await agent.aiAction('Google.com sayfasına git ve "acabAI" ara');

  console.log('İşlem sonucu:', result.result);
  console.log('Metadata:', result.metadata);

  // Tarayıcıyı kapat
  await browser.close();
}

run().catch(console.error);
```

### Puppeteer-Extra Özellikleriyle Kullanım

```javascript
import { puppeteerAgentForTarget } from '@acabai/web';

async function run() {
  const { agent, freeFn } = await puppeteerAgentForTarget({
    url: 'https://www.google.com',
  }, {
    headed: true, // Görünür tarayıcı
    enableStealth: true, // Stealth modu etkinleştir
    enableAdBlocker: true, // Reklam engelleyiciyi etkinleştir
    adBlockerOptions: {
      blockTrackers: true, // İzleyicileri de engelle
    }
  });

  // AI komutlarını çalıştır
  const result = await agent.aiAction('acabAI hakkında bilgi ara');

  // Kaynakları temizle
  for (const fn of freeFn) {
    fn.fn();
  }
}

run().catch(console.error);
```

### YAML ile Kullanım

```yaml
name: Google Arama Örneği
env:
  url: https://www.google.com
  enableStealth: true
  enableAdBlocker: true
  adBlockerOptions:
    blockTrackers: true
steps:
  - name: Google'da Arama Yap
    actions:
      - aiAction: acabAI hakkında bilgi ara
      - sleep: 2000
      - aiAssert: Sonuçlar acabAI ile ilgili bilgiler içeriyor
```

```javascript
import { parseYamlScript, ScriptPlayer } from '@acabai/web';
import { readFileSync } from 'fs';
import { puppeteerAgentForTarget } from '@acabai/web';

async function runYaml() {
  const yamlContent = readFileSync('./test.yaml', 'utf-8');
  const script = parseYamlScript(yamlContent);

  const player = new ScriptPlayer(script, puppeteerAgentForTarget);
  await player.run();

  console.log('Sonuç:', player.result);
}

runYaml().catch(console.error);
```

## Puppeteer-Extra Özellikleri

### Stealth Modu

Stealth modu, web sitelerinin bot algılama mekanizmalarını atlatmanıza yardımcı olur. Bu mod, Puppeteer'ın otomatik bir tarayıcı olarak tespit edilmesini zorlaştırır.

```javascript
const agent = new PuppeteerAgent(page, {
  enableStealth: true
});
```

### Reklam Engelleyici

Reklam engelleyici, web sayfalarındaki reklamları ve isteğe bağlı olarak izleyicileri engeller. Bu, sayfaların daha hızlı yüklenmesini sağlar ve otomasyonunuzun reklamlar tarafından engellenmesini önler.

```javascript
const agent = new PuppeteerAgent(page, {
  enableAdBlocker: true,
  adBlockerOptions: {
    blockTrackers: true, // İzleyicileri de engelle (varsayılan: true)
    path: './my-custom-rules.txt' // İsteğe bağlı: Özel engelleme kuralları dosyası
  }
});
```

## AI Görev Sonuçları

Tüm AI görevleri, hem sonucu hem de metadata'yı içeren bir `AITaskResult` nesnesi döndürür:

```typescript
interface AITaskResult<T = any> {
  /** İşlemin gerçek sonucu */
  result: T;
  /** Görev yürütme hakkında metadata */
  metadata: AITaskMetadata;
}
```

```javascript
import { PuppeteerAgent } from '@acabai/web';

// ...

const result = await agent.aiAction('Google.com sayfasına git ve "acabAI" ara');
console.log(result.result); // Görevin sonucu (genellikle bir string)
console.log(result.metadata); // Görev metadata'sı
```

Metadata, aşağıdaki bilgileri içerir:

- Görev durumu ve zamanlama bilgileri
- Önbellek ve token kullanımı
- AI'nin düşünce süreci
- Öğe konumlandırma bilgileri
- Planlama ve içgörü detayları
- Eylem bilgileri ve detayları

## Desteklenen Görevler

- `aiAction`: Doğal dil komutlarıyla karmaşık eylemler gerçekleştirin
- `aiTap`: Belirtilen öğeye tıklayın
- `aiHover`: Belirtilen öğenin üzerine gelin
- `aiInput`: Belirtilen öğeye metin girin
- `aiKeyboardPress`: Klavye tuşlarına basın
- `aiScroll`: Sayfayı kaydırın
- `aiQuery`: Sayfadan bilgi çıkarın
- `aiAssert`: Sayfanın belirli bir durumda olduğunu doğrulayın
- `aiWaitFor`: Belirli bir koşulun gerçekleşmesini bekleyin

## Lisans

MIT