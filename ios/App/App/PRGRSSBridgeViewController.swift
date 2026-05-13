import UIKit
import WebKit
import Capacitor

/// WKWebView w Capacitorze ma własny `UIScrollView` — CSS nie wyłącza jego pasków przewijania.
/// Jednolite tło `#090C11` pod całą sceną ogranicza „czarną szczelinę” pod web treścią.
final class PRGRSSBridgeViewController: CAPBridgeViewController {

    private static let appBackground = UIColor(
        red: 9.0 / 255.0,
        green: 12.0 / 255.0,
        blue: 17.0 / 255.0,
        alpha: 1.0
    )

    /// Górny inset musi działać nawet gdy `ios/App/App/public` jest niezsynchronizowany z `out/`
    /// albo WKWebView odrzuca część reguł z bundla. `!important` + `WKUserScript` wymuszają odstęp.
    override func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
        let configuration = super.webViewConfiguration(for: instanceConfiguration)
        let css = """
        .app-shell {
          padding-top: 2rem !important;
          padding-top: calc(2rem + constant(safe-area-inset-top)) !important;
          padding-top: calc(2rem + env(safe-area-inset-top)) !important;
        }
        """
        let cssB64 = Data(css.utf8).base64EncodedString()
        let js = """
        (function(){
          try {
            var id = 'prgrss-safe-top';
            if (document.getElementById(id)) { return; }
            var s = document.createElement('style');
            s.id = id;
            s.setAttribute('data-prgrss','safe-top');
            s.appendChild(document.createTextNode(atob('\(cssB64)')));
            (document.head || document.documentElement).appendChild(s);
          } catch (e) {}
        })();
        """
        let script = WKUserScript(source: js, injectionTime: .atDocumentEnd, forMainFrameOnly: true)
        configuration.userContentController.addUserScript(script)
        return configuration
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        applyWebViewChrome()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        // Czasem iOS przywraca wskaźniki po przejściu w tło — ustawiamy ponownie.
        applyWebViewChrome()
    }

    private func applyWebViewChrome() {
        view.backgroundColor = Self.appBackground
        guard let webView else { return }

        let scroll = webView.scrollView
        scroll.showsVerticalScrollIndicator = false
        scroll.showsHorizontalScrollIndicator = false
        scroll.backgroundColor = Self.appBackground
        scroll.isScrollEnabled = false

        webView.backgroundColor = Self.appBackground
        webView.isOpaque = true
        scroll.isOpaque = true
    }
}
