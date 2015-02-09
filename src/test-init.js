'use strict';

import chai from 'chai';
global.expect = chai.expect;

import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import { Promise } from 'es6-promise';
if (!global.Promise) global.Promise = Promise;

import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();
