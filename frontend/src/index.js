// @ts-nocheck

import React from 'react'
import { createRoot } from 'react-dom/client'

function importBuildTarget() {
  // console.log('NODE_ENV: %o', process.env.NODE_ENV)
  // console.log('REACT_APP_BUILD_TARGET: %o', process.env.REACT_APP_BUILD_TARGET)
  // DefinePlugin in webpack.config.js will substitute
  // process.env.REACT_APP_BUILD_TARGET with it's value at build time.
  // https://webpack.js.org/plugins/define-plugin/

  // TerserPlugin in webpack.config.js will eliminate dead code
  // ...if we make it easy enough (no maps or switches, etc).
  // https://webpack.js.org/plugins/terser-webpack-plugin/

  if (process.env.NODE_ENV === 'development') {
    return import('./App.js')
  }
  if (process.env.REACT_APP_BUILD_TARGET === 'PublicApp') {
    return import('./PublicApp.js')
  } else if (process.env.REACT_APP_BUILD_TARGET === 'DashboardApp') {
    return import('./DashboardApp.js')
  } else {
    return import('./App.js')
    // return Promise.reject(
    //   new Error("No such build target: " + process.env.REACT_APP_BUILD_TARGET)
    // );
  }
}

const rootElement = document.getElementById('root')
const root = createRoot(rootElement)

// Import the entry point and render it's default export
importBuildTarget().then(({ default: Environment }) => root.render(<Environment />))
