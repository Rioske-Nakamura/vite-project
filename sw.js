import {warmStrategyCache} from "workbox-recipes"
import {CacheFist, StaleWhileRevalidate} from "workbox-strategies"
import {RegisterRoute} from "workbox-routing"
import {CacheableReponsePlugin} from "workbox-cacheable-response"
import{ExpirationPlugin} from "workbox-expiration"
import{offlineFallback} from "workbox-recipes"


const pagecache = new CacheFist(
  {
    cacheName:"page-cache",
    plugins: [
      new CacheableReponsePlugin({
        statuses:[0,200]
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60
      })
    ]
  }
)

warmStrategyCache({
  urls:["/index.html","/"],
  cacheName: pageCache,
})

RegisterRoute(({request})=>request.mode === "navigate", pageCache)

offlineFallback({
  PageFallback: "/offline.html"
})

const ImageRoute = new Route(({request}) =>{
  return request.destination === "image"
},
new CacheFist({
  cacheName:"image",
  plugins: [
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60
    })
  ]
})
)