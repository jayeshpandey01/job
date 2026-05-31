2026-05-31T15:01:18.221942161Z 137 packages are looking for funding
2026-05-31T15:01:18.222015045Z   run `npm fund` for details
2026-05-31T15:01:18.22439541Z 
2026-05-31T15:01:18.22440229Z 2 vulnerabilities (1 moderate, 1 high)
2026-05-31T15:01:18.22440533Z 
2026-05-31T15:01:18.224409011Z To address all issues, run:
2026-05-31T15:01:18.224412121Z   npm audit fix
2026-05-31T15:01:18.224415101Z 
2026-05-31T15:01:18.224418131Z Run `npm audit` for details.
2026-05-31T15:01:18.442345023Z 
2026-05-31T15:01:18.442365474Z > client@0.0.0 build
2026-05-31T15:01:18.442370455Z > vite build
2026-05-31T15:01:18.442375445Z 
2026-05-31T15:01:18.622577843Z vite v6.4.2 building for production...
2026-05-31T15:01:18.888302359Z transforming...
2026-05-31T15:01:23.699141552Z ✓ 2892 modules transformed.
2026-05-31T15:01:24.30560557Z rendering chunks...
2026-05-31T15:01:24.32461134Z computing gzip size...
2026-05-31T15:01:24.361024275Z dist/index.html                              1.19 kB │ gzip:   0.53 kB
2026-05-31T15:01:24.361047706Z dist/assets/walmart_logo-BNc35QHy.svg        5.03 kB │ gzip:   2.11 kB
2026-05-31T15:01:24.361093409Z dist/assets/samsung_logo-BxQL65ad.png        5.79 kB
2026-05-31T15:01:24.36112097Z dist/assets/amazon_logo-Bm1anaQD.png         5.92 kB
2026-05-31T15:01:24.361181013Z dist/assets/microsoft_logo-BrRPO5-k.svg      6.09 kB │ gzip:   2.58 kB
2026-05-31T15:01:24.361189914Z dist/assets/profile_img-PzVhdWdg.png         8.56 kB
2026-05-31T15:01:24.361230086Z dist/assets/play_store-DQQw24uI.svg          8.86 kB │ gzip:   2.92 kB
2026-05-31T15:01:24.361234136Z dist/assets/adobe_logo-DxU2Zu01.png         13.08 kB
2026-05-31T15:01:24.361283159Z dist/assets/app_store-WdCzOnJI.svg          13.93 kB │ gzip:   5.47 kB
2026-05-31T15:01:24.361287309Z dist/assets/logo-3syRoDZ6.svg               39.39 kB │ gzip:  16.47 kB
2026-05-31T15:01:24.36130067Z dist/assets/app_main_img-ihNWWlWX.png      116.19 kB
2026-05-31T15:01:24.361332571Z dist/assets/index-B0Q-wiAd.css             116.04 kB │ gzip:  19.66 kB
2026-05-31T15:01:24.361357353Z dist/assets/index-DkpTTt4l.js            1,385.63 kB │ gzip: 385.16 kB
2026-05-31T15:01:24.36148804Z 
2026-05-31T15:01:24.36149497Z (!) Some chunks are larger than 500 kB after minification. Consider:
2026-05-31T15:01:24.3614982Z - Using dynamic import() to code-split the application
2026-05-31T15:01:24.36150164Z - Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
2026-05-31T15:01:24.36150481Z - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
2026-05-31T15:01:24.361795526Z ✓ built in 5.72s
2026-05-31T15:01:26.688333974Z ==> Uploading build...
2026-05-31T15:01:33.71190267Z ==> Uploaded in 4.2s. Compression took 2.8s
2026-05-31T15:01:33.741576691Z ==> Build successful 🎉
2026-05-31T15:01:39.195313176Z ==> Deploying...
2026-05-31T15:01:39.411169503Z ==> Setting WEB_CONCURRENCY=1 by default, based on available CPUs in the instance
2026-05-31T15:01:57.707435067Z ==> Running 'npm run server'
2026-05-31T15:01:58.91588089Z npm error Missing script: "server"
2026-05-31T15:01:58.915904791Z npm error
2026-05-31T15:01:58.915909011Z npm error To see a list of scripts, run:
2026-05-31T15:01:58.915913341Z npm error   npm run
2026-05-31T15:01:58.917471405Z npm error A complete log of this run can be found in: /opt/render/.cache/_logs/2026-05-31T15_01_58_423Z-debug-0.log
2026-05-31T15:02:03.890795751Z ==> Exited with status 1
2026-05-31T15:02:03.893251236Z ==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys