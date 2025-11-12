// ============================================================
// Ictus GPS - Script principal Cordova
// ============================================================

// ====== EVENTO DEVICE READY ======
document.addEventListener("deviceready", function() {
  try {
    console.log("Cordova ready:", cordova.platformId, cordova.version);

    // ===== STATUS BAR (versión robusta Cordova / Capacitor) =====
(function configurarStatusBar() {
  const COLOR_INSTITUCIONAL = "#0F3D83";

  if (!window.StatusBar) {
    console.warn("ℹ️ Plugin StatusBar no detectado (modo navegador o sin plugin).");
    return;
  }

  // Ejecución retardada para asegurar contexto nativo listo
  setTimeout(() => {
    try {
      // Evita superposición sobre la vista web
      StatusBar.overlaysWebView(false);

      // Color institucional y estilo claro
      StatusBar.backgroundColorByHexString(COLOR_INSTITUCIONAL);
      StatusBar.styleLightContent();

      // Mostrar si está oculta
      StatusBar.show();

      // 🔹 Si existe plugin de navegación (Android), sincroniza el color también
      if (window.AndroidFullScreen && AndroidFullScreen.setSystemUiVisibility) {
        try {
          AndroidFullScreen.setSystemUiVisibility({
            statusBarColor: COLOR_INSTITUCIONAL,
            navigationBarColor: COLOR_INSTITUCIONAL,
            statusBarLight: false,
            navigationBarLight: false
          });
        } catch (e) {
          console.warn("⚠️ No se pudo aplicar color a Navigation Bar:", e);
        }
      }

      console.log("✅ Barra de estado configurada correctamente:", COLOR_INSTITUCIONAL);
    } catch (err) {
      console.error("❌ Error al aplicar configuración de StatusBar:", err);
    }
  }, 600);
})();


    // ===== SPLASH =====
    if (navigator.splashscreen) {
      setTimeout(() => {
        try {
          navigator.splashscreen.hide();
          if (window.StatusBar) {
            StatusBar.backgroundColorByHexString("#0F3D83");
            StatusBar.styleLightContent();
            StatusBar.overlaysWebView(false);
          }
        } catch (e) {
          console.warn("⚠️ Error al ocultar Splash:", e);
        }
      }, 500);
    }

    // ===== NAVIGATION BAR (Android 8+) =====
    if (window.AndroidFullScreen && AndroidFullScreen.setSystemUiVisibility) {
      try {
        AndroidFullScreen.setSystemUiVisibility({
          statusBarColor: "#0F3D83",
          navigationBarColor: "#0F3D83",
          statusBarLight: false,
          navigationBarLight: false
        });
      } catch (e) {
        console.warn("⚠️ Navigation bar color no soportado:", e);
      }
    } else if (window.navigator && window.navigator.plugins) {
      const navMeta = document.createElement("meta");
      navMeta.name = "theme-color";
      navMeta.content = "#0F3D83";
      document.head.appendChild(navMeta);
    }

  } catch (e) {
    alert("❌ Error en deviceready: " + e.message);
    console.error("Error deviceready:", e);
  }
});

  // ====== ZOOM ======
  (function() {
    const oldVp = document.querySelector('meta[name="viewport"]');
    if (oldVp) oldVp.remove();
    const vp = document.createElement("meta");
    vp.name = "viewport";
    vp.content =
      "width=device-width, initial-scale=1.0, minimum-scale=0.5, maximum-scale=3.0, user-scalable=yes, viewport-fit=cover";
    document.head.appendChild(vp);
  })();

  // ====== VIBRACIÓN GLOBAL ======
  function vibrar(ms = 40) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  document.body.addEventListener(
    "click",
    (e) => {
      const el = e.target;
      const isButton =
        el.tagName.toLowerCase() === "button" ||
        el.classList.contains("btn") ||
        el.closest(".btn");
      if (isButton) vibrar();
    },
    true
  );

// ====== BOTÓN "ATRÁS" (Android con Toast estilo Ictus GPS) ======
let backPressedOnce = false;

document.addEventListener("backbutton", function (e) {
  e.preventDefault();
  const url = window.location.href;
  const isHome = url.includes("index.html") || url.endsWith("/");

  if (isHome) {
    if (backPressedOnce) {
      navigator.app.exitApp();
      return;
    }
    backPressedOnce = true;
    mostrarToastIctus("Pulsa de nuevo para salir");

    setTimeout(() => {
      backPressedOnce = false;
    }, 2000);
  } else {
    if (window.history.length > 1) window.history.back();
    else navigator.app.backHistory();
  }
}, false);

// ====== FUNCIÓN TOAST ESTILO ICTUS GPS ======
function mostrarToastIctus(mensaje) {
  let toast = document.getElementById("toast-ictus");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-ictus";
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "60px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#0f3d83", // azul institucional
      color: "#ffffff",
      padding: "10px 20px",
      borderRadius: "25px",
      fontSize: "14px",
      fontFamily: "Verdana, Geneva, sans-serif",
      fontWeight: "500",
      zIndex: "9999",
      boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
      opacity: "0",
      transition: "opacity 0.3s ease, transform 0.3s ease",
    });
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.style.opacity = "1";
  toast.style.transform = "translateX(-50%) translateY(-8px)";

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(0)";
  }, 1500);
}


// ============================================================
// EXPORTAR PDF (versión robusta Cordova)
// ============================================================
async function exportarPDFconCabecera(elementId, nombreArchivo = "Informe_Ictus.pdf") {
  // 1) Comprobar librería
  if (typeof html2pdf === "undefined") {
    alert("Falta html2pdf.bundle.min.js. Inclúyelo antes de index.js");
    return;
  }

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      alert("No se encontró el contenido para exportar.");
      return;
    }

    // ===== Overlay de carga =====
    let overlay = document.getElementById("pdfOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "pdfOverlay";
      Object.assign(overlay.style, {
        position: "fixed",
        top: "0", left: "0",
        width: "100vw", height: "100vh",
        background: "rgba(255,255,255,0.9)",
        zIndex: "9999", display: "flex",
        flexDirection: "column", justifyContent: "center", alignItems: "center",
        fontFamily: "Verdana, Geneva, sans-serif",
      });
      overlay.innerHTML = `
        <div style="border:4px solid #e5e7eb;border-top:4px solid #0f3d83;border-radius:50%;width:48px;height:48px;animation:spin 1s linear infinite;"></div>
        <p style="margin-top:16px;color:#0f3d83;font-weight:600;">Generando informe PDF…</p>
        <style>@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>
      `;
      document.body.appendChild(overlay);
    } else {
      overlay.style.display = "flex";
    }

    // ===== Preparar logo como dataURL (evita CORS en file://) =====
    async function cargarLogoDataURL() {
      try {
        // Ruta absoluta dentro del APK/Bundle
        const rutaLogo =
          (window.cordova && cordova.file && cordova.file.applicationDirectory)
            ? cordova.file.applicationDirectory + "www/iconos/ictusgps.png"
            : "iconos/ictusgps.png"; // en navegador
        const resp = await fetch(rutaLogo);
        const blob = await resp.blob();
        return await new Promise((res) => {
          const r = new FileReader();
          r.onload = () => res(r.result);
          r.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    }
    const logoDataURL = await cargarLogoDataURL();

    // ===== Construcción del contenido (debe estar en el DOM, pero fuera de vista) =====
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-99999px"; // fuera de pantalla, NO display:none
    wrapper.style.top = "0";
    wrapper.style.width = "794px";   // aprox ancho A4 a 96dpi para consistencia
    wrapper.style.padding = "20px";
    wrapper.style.fontFamily = "Verdana, Geneva, sans-serif";
    wrapper.style.color = "#0e1a33";
    wrapper.style.background = "#fff";

    const cabeceraHTML = `
      <div style="text-align:center;margin-bottom:20px;">
        ${logoDataURL ? `<img src="${logoDataURL}" style="height:70px;margin-bottom:10px;">`
                       : `<div style="height:70px"></div>`}
        <h2 style="color:#0f3d83;margin:0;">Unidad de Ictus Málaga</h2>
        <hr style="border:1px solid #0f3d83;margin-top:10px;">
      </div>
    `;
    wrapper.innerHTML = cabeceraHTML;

    const contenido = element.cloneNode(true);
    contenido.style.margin = "20px 0";
    wrapper.appendChild(contenido);

    const fecha = new Date().toLocaleString("es-ES");
    const pieHTML = `
      <div style="text-align:center;margin-top:30px;font-size:0.8rem;">
        <hr style="border:1px solid #0f3d83;margin-bottom:6px;">
        <p style="margin:0;color:#64748b;">Generado con Ictus GPS — ${fecha}</p>
        <p style="margin:0;color:#64748b;">www.unidadictusmalaga.com</p>
      </div>
    `;
    wrapper.insertAdjacentHTML("beforeend", pieHTML);

    document.body.appendChild(wrapper); // <-- clave para que html2canvas tome estilos

    // ===== Opciones html2pdf / html2canvas =====
    const opt = {
      margin: 10,
      filename: nombreArchivo,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true, // tolera imágenes file://
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // Asegura tipografías/estilos si usas CSS externos
        }
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // ===== Generar PDF (Blob) =====
    const pdfBlob = await html2pdf().set(opt).from(wrapper).toPdf().get("pdf").then(pdf => pdf.output("blob"));

    // Limpieza del wrapper temporal
    wrapper.remove();

    // ===== Guardar en app o navegador =====
    if (window.cordova && window.resolveLocalFileSystemURL && cordova.file) {
      // Preferible almacenamiento interno de la app (no requiere permisos)
      const path = cordova.file.dataDirectory; // p.ej. /data/data/<app>/files/
      window.resolveLocalFileSystemURL(path, (dir) => {
        dir.getFile(nombreArchivo, { create: true }, (file) => {
          file.createWriter((writer) => {
            writer.onwriteend = () => {
              overlay.style.display = "none";
              // Abrir PDF
              if (window.cordova.plugins && window.cordova.plugins.fileOpener2) {
                cordova.plugins.fileOpener2.open(path + nombreArchivo, "application/pdf");
              } else {
                alert("PDF guardado en la app (no se pudo abrir automáticamente).");
              }
            };
            writer.onerror = (e) => {
              console.error("Error al escribir PDF:", e);
              overlay.style.display = "none";
              alert("No se pudo guardar el PDF.");
            };
            writer.write(pdfBlob);
          });
        }, (e) => {
          console.error("Error getFile:", e);
          overlay.style.display = "none";
          alert("No se pudo crear el fichero PDF.");
        });
      }, (e) => {
        console.error("Error resolveLocalFileSystemURL:", e);
        overlay.style.display = "none";
        alert("No se pudo acceder al directorio de la app.");
      });
    } else {
      // Navegador
      const blobUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = nombreArchivo;
      a.click();
      URL.revokeObjectURL(blobUrl);
      overlay.style.display = "none";
    }
  } catch (err) {
    console.error("Error PDF:", err);
    alert("Error al generar el PDF.");
    const overlay = document.getElementById("pdfOverlay");
    if (overlay) overlay.style.display = "none";
  }
}
