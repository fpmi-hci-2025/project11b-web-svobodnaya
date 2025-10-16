import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../src/App.vue'

describe('App.vue', () => {
  it('renders Hello, world! message', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Hello, world!')
  })

  it('renders subtitle', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Vue.js Demo Application')
  })

  it('has correct component name', () => {
    const wrapper = mount(App)
    expect(wrapper.vm.$options.name).toBe('App')
  })

  it('message data is correct', () => {
    const wrapper = mount(App)
    expect(wrapper.vm.message).toBe('Hello, world!')
  })
})
