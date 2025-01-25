import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { registerLicense } from "@syncfusion/ej2-base";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

registerLicense("Ngo9BigBOggjHTQxAR8/V1NCaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXheeXRcQ2FdWUd+XEc=");
if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));

if ('serviceWorker' in navigator) {
  // Registracija Angular Service Workera
  // navigator.serviceWorker.register('/ngsw-worker.js')
  //   .then(registration => {
  //     console.log('Angular Service Worker registered:', registration);
  //   })
  //   .catch(error => {
  //     console.error('Failed to register Angular Service Worker:', error);
  //   });

  // Registracija prilagođenog Service Workera
  navigator.serviceWorker.register('/sw-custom.js')
    .then(registration => {
      console.log('Custom Service Worker registered:', registration);
    })
    .catch(error => {
      console.error('Failed to register Custom Service Worker:', error);
    });
}


