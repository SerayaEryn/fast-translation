'use strict'

const test = require('ava')
const Translation = require('../lib/Translator')
const HttpSource = require('..').HttpSource
const http = require('http')

test.cb('should load translations from http server', (t) => {
  t.plan(5)

  const express = require('express')
  const app = express()

  app.get('/locales/de/DE/', function (req, res) {
    res.json({
      test: {
        title: '__count__ singular',
        title_plural_2: '__count__ plural'
      }
    })
  })

  const server = http.createServer(app)
  const listener = server.listen(0, () => {
    const port = listener.address().port

    const translation = new Translation({
      preloadLanguages: ['de'],
      preloadNamespaces: ['DE']
    })
    return translation
      .addRule('de', [1, 2], function (number) {
        return number === 1 ? 0 : 1
      })
      .use(new HttpSource({
        url: `http://localhost:${port}/locales/__language__/__namespace__`
      }))
      .initialize()
      .then(() => {
        server.unref()
        t.is(translation.translate('unknown.key', {
          language: 'de',
          namespace: 'DE'
        }), 'unknown.key')
        t.is(translation.translate('test.title', {
          language: 'de',
          namespace: 'DE'
        }), 'undefined singular')
        t.is(translation.translate('test.title', {
          count: 1,
          language: 'de',
          namespace: 'DE'
        }), '1 singular')
        t.is(translation.translate('test.title', {
          count: 2,
          language: 'de',
          namespace: 'DE'
        }), '2 plural')
        t.is(translation.translate('test.title', {
          count: 0,
          language: 'de',
          namespace: 'DE'
        }), '0 plural')
        t.end()
      })
  })
})

test.cb('should handle server error', (t) => {
  t.plan(1)

  const express = require('express')
  const app = express()

  app.get('/locales/de/DE/', function (req, res) {
    res.status(500)
    res.end()
  })

  const server = http.createServer(app)
  const listener = server.listen(0, () => {
    const port = listener.address().port

    const translation = new Translation({
      preloadLanguages: ['de'],
      preloadNamespaces: ['DE']
    })
    return translation
      .addRule('de', [1, 2], function (number) {
        return number === 1 ? 0 : 1
      })
      .use(new HttpSource({
        url: `http://localhost:${port}/locales/__language__/__namespace__`
      }))
      .initialize()
      .catch((err) => {
        server.unref()
        t.truthy(err)
        t.end()
      })
  })
})

test.cb('Should reject on invalid json', (t) => {
  t.plan(1)

  const express = require('express')
  const app = express()

  app.get('/locales/de/DE/', function (req, res) {
    res.send("{\"test\": {\"title\": \"__count__ singular,\"title_plural2: '__count__ plural\"}}")
  })

  const server = http.createServer(app)
  const listener = server.listen(0, () => {
    const port = listener.address().port

    const translation = new Translation({
      preloadLanguages: ['de'],
      preloadNamespaces: ['DE']
    })
    return translation
      .addRule('de', [1, 2], function (number) {
        return number === 1 ? 0 : 1
      })
      .use(new HttpSource({
        url: `http://localhost:${port}/locales/__language__/__namespace__`
      }))
      .initialize()
      .catch((err) => {
        server.unref()
        t.truthy(err)
        t.end()
      })
  })
})
