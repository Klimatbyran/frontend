import vikeReact from 'vike-react/config'

export default {
  // Extend vike-react config
  extends: [vikeReact],
  
  // We don't use pre-rendering
  prerender: false,
  
  // Global head tags
  title: 'Klimatkollen',
  description: 'Klimatkollen hjälper dig att förstå klimatpåverkan från företag och kommuner i Sverige.',
  viewport: 'width=device-width, initial-scale=1.0'
}
