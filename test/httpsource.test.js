'use strict';

const tap = require('tap');
const test = tap.test;
const Translation = require('../lib/Translator');
const HttpSource = require('../lib/sources/HttpSource');
const http = require('http');
const fs = require('fs');

test('should load translations from http server', (t) => {
  t.plan(6);

  const express = require('express');
  const app = express();
  
  app.get('/locales/de/DE/', function(req, res){
    res.json({
      test: {
        title: '__count__ singular',
        title_plural_2: '__count__ plural'
      }
    });
  });
  
  const server = http.createServer(app);
  const listener = server.listen(0, () => {
    const port = listener.address().port;
  
    const translation = new Translation({
      preloadLanguages: ['de'],
      preloadNamespaces: ['DE']
    });
    return translation
      .addRule('de', [1, 2], function (number) {
        return number === 1 ? 0 : 1;
      })
      .use(new HttpSource({
        url: `http://localhost:${port}/locales/__language__/__namespace__`,
        filePath: __dirname + '/test.json'
      }))
      .initialize()
      .then(() => {
        server.unref()
        t.strictEquals(translation.translate('unknown.key', {
          language: 'de',
          namespace: 'DE'
        }), 'unknown.key');
        t.strictEquals(translation.translate('test.title', {
          language: 'de',
          namespace: 'DE'
        }), 'undefined singular');
        t.strictEquals(translation.translate('test.title', {
          count: 1,
          language: 'de',
          namespace: 'DE'
        }), '1 singular');
        t.strictEquals(translation.translate('test.title', {
          count: 2,
          language: 'de',
          namespace: 'DE'
        }), '2 plural');
        t.strictEquals(translation.translate('test.title', {
          count: 0,
          language: 'de',
          namespace: 'DE'
        }), '0 plural');
        fs.unlink(__dirname + '/test.json', (err) => t.error(err));
      })
  });
});

test('', (t) => {
  t.plan(1);

  const express = require('express');
  const app = express();
  
  app.get('/locales/de/DE/', function(req, res){
    res.status(500);
    res.end()
  });
  
  const server = http.createServer(app);
  const listener = server.listen(0, () => {
    const port = listener.address().port;
  
    const translation = new Translation({
      preloadLanguages: ['de'],
      preloadNamespaces: ['DE']
    });
    return translation
      .addRule('de', [1, 2], function (number) {
        return number === 1 ? 0 : 1;
      })
      .use(new HttpSource({
        url: `http://localhost:${port}/locales/__language__/__namespace__`
      }))
      .initialize()
      .catch((err) => {
        server.unref();
        t.ok(err);
      })
  });
});

test('Should reject on invalid json', (t) => {
  t.plan(1);

  const express = require('express');
  const app = express();
  
    
  app.get('/locales/de/DE/', function(req, res){
    res.send("{\"test\": {\"title\": \"__count__ singular,\"title_plural2: '__count__ plural\"}}");
  });
  
  const server = http.createServer(app);
  const listener = server.listen(0, () => {
    const port = listener.address().port;
  
    const translation = new Translation({
      preloadLanguages: ['de'],
      preloadNamespaces: ['DE']
    });
    return translation
      .addRule('de', [1, 2], function (number) {
        return number === 1 ? 0 : 1;
      })
      .use(new HttpSource({
        url: `http://localhost:${port}/locales/__language__/__namespace__`
      }))
      .initialize()
      .catch((err) => {
        server.unref();
        t.ok(err);
      })
  });
});