// ============================================================
// Ictus GPS - Script principal Cordova
// ============================================================

document.addEventListener("deviceready", function() {
  console.log("Cordova ready:", cordova.platformId, cordova.version);

  // ====== STATUS BAR ======
  if (window.StatusBar) {
    StatusBar.backgroundColorByHexString("#0f3d83");
    StatusBar.styleLightContent();
    StatusBar.show();
  }

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

  // ====== BOTÓN "ATRÁS" ======
  document.addEventListener(
    "backbutton",
    function () {
      const path = window.location.pathname;
      const isHome = path.endsWith("/index.html") || path.endsWith("/");

      if (isHome) {
        // Confirmar salida
        if (window.confirm("¿Deseas salir de Ictus GPS?")) {
          navigator.app.exitApp();
        }
      } else {
        navigator.app.backHistory();
      }
    },
    false
  );
}, false);

// ============================================================
// EXPORTAR PDF
// ============================================================

async function exportarPDFconCabecera(
  elementId,
  nombreArchivo = "Informe_Ictus.pdf"
) {
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
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        background: "rgba(255,255,255,0.9)",
        zIndex: "9999",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Verdana, Geneva, sans-serif",
      });
      overlay.innerHTML = `
        <div style="border:4px solid #e5e7eb;border-top:4px solid #0f3d83;border-radius:50%;width:48px;height:48px;animation:spin 1s linear infinite;"></div>
        <p style="margin-top:16px;color:#0f3d83;font-weight:600;">Generando informe PDF…</p>
        <style>@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>
      `;
      document.body.appendChild(overlay);
    } else overlay.style.display = "flex";

    // ===== Construcción del contenido =====
    const wrapper = document.createElement("div");
    wrapper.style.padding = "20px";
    wrapper.style.fontFamily = "Verdana, Geneva, sans-serif";
    wrapper.style.color = "#0e1a33";

    wrapper.innerHTML = `
      <div style="text-align:center;margin-bottom:20px;">
        <img src="../iconos/ictusgps.png" style="height:70px;margin-bottom:10px;">
        <h2 style="color:#0f3d83;margin:0;">Unidad de Ictus Málaga</h2>
        <hr style="border:1px solid #0f3d83;margin-top:10px;">
      </div>
    `;
    const contenido = element.cloneNode(true);
    contenido.style.margin = "20px 0";
    wrapper.appendChild(contenido);

    const fecha = new Date().toLocaleString("es-ES");
    wrapper.innerHTML += `
      <div style="text-align:center;margin-top:30px;font-size:0.8rem;">
        <hr style="border:1px solid #0f3d83;margin-bottom:6px;">
        <p style="margin:0;color:#64748b;">Generado con Ictus GPS — ${fecha}</p>
        <p style="margin:0;color:#64748b;">www.unidadictusmalaga.com</p>
      </div>
    `;

    // ===== Generar PDF con html2pdf.js =====
    const opt = {
      margin: 10,
      filename: nombreArchivo,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    const pdfBlob = await html2pdf()
      .set(opt)
      .from(wrapper)
      .toPdf()
      .get("pdf")
      .then((pdf) => pdf.output("blob"));

    // ===== Guardar en app o navegador =====
    if (window.cordova && window.resolveLocalFileSystemURL && cordova.file) {
      const path = cordova.file.externalDataDirectory;
      window.resolveLocalFileSystemURL(path, (dir) => {
        dir.getFile(nombreArchivo, { create: true }, (file) => {
          file.createWriter((writer) => {
            writer.onwriteend = () => {
              overlay.style.display = "none";
              if (window.cordova.plugins.fileOpener2)
                cordova.plugins.fileOpener2.open(
                  path + nombreArchivo,
                  "application/pdf"
                );
            };
            writer.write(pdfBlob);
          });
        });
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
