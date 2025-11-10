package com.ictusgps.app;

import android.os.Bundle;
import android.view.Window;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Asegura que el contenido NO se meta bajo las barras del sistema
        Window window = getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, true);

        // Asegura colores coherentes en las barras
        window.setStatusBarColor(0xFF0F3D83); // azul institucional
        window.setNavigationBarColor(0xFF0F3D83);

        // Habilitar zoom táctil en el WebView
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().getSettings().setBuiltInZoomControls(true);
            this.bridge.getWebView().getSettings().setDisplayZoomControls(false);
            this.bridge.getWebView().getSettings().setSupportZoom(true);
        }
    }

    @Override
    public void onBackPressed() {
        if (this.bridge != null && this.bridge.getWebView().canGoBack()) {
            this.bridge.getWebView().goBack();
        } else {
            super.onBackPressed();
        }
    }
}
