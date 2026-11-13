package com.lunhui.xiuzheng;

import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);

        webView = new WebView(this);
        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setAllowFileAccess(true);
        ws.setAllowContentAccess(true);
        ws.setCacheMode(WebSettings.LOAD_DEFAULT);
        webView.setWebViewClient(new WebViewClient());
        webView.addJavascriptInterface(new Bridge(getSharedPreferences("game", MODE_PRIVATE)), "Android");

        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    /** 提供给 JS 的存档桥：存到 Android SharedPreferences，保证 file:// 下存档不丢 */
    private static class Bridge {
        private final SharedPreferences sp;

        Bridge(SharedPreferences sp) {
            this.sp = sp;
        }

        @JavascriptInterface
        public void save(String data) {
            sp.edit().putString("save", data).apply();
        }

        @JavascriptInterface
        public String load() {
            return sp.getString("save", null);
        }

        @JavascriptInterface
        public void clear() {
            sp.edit().remove("save").apply();
        }
    }
}
