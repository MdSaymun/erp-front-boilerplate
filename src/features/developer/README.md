# developer module

Developer-only showcase of every shared ERP pattern (list, record, form, inputs, import,
widgets, report) on a neutral sample entity served by Mock Service Worker. Mounted only
when `env.devToolsEnabled`; never part of production builds.

It is also the reference the module generator (`npm run generate:module`) is modelled on.
Keep it working when you change a shared component.
