var should = require('should');
var simple = require('simple-mock');
var Command = require('../lib/command');
var commands = require('../lib/commands');

describe('Command', function() {
  var code, command, sender, target, data, buffer;

  beforeEach(function() {
    code = 0x0031;
    data = { test: 'data' };
    buffer = new Buffer([1, 2, 3]);
    sender = { subnet: 1, id: 3 };
    target = { subnet: 1, id: 10 };
  });

  afterEach(function() {
    simple.restore();
  });

  describe('initialization', function() {
    it('should set properties on initialization', function() {
      command = new Command(code, {
        sender: sender,
        target: target
      });

      should(command).have.properties({
        code: code,
        sender: sender,
        target: target
      });
    });

    it('should set data object', function() {
      command = new Command(code, {
        data: data
      });

      should(command).have.properties({
        data: data
      });
    });
  });

  describe('described command', function() {
    var parse, encode;

    beforeEach(function() {
      var command = simple.mock(commands, code, {});

      parse = simple.mock(command, 'parse').returnWith(data);
      encode = simple.mock(command, 'encode').returnWith(buffer);
    });

    it('should parse data buffer', function() {
      command = new Command(code, {
        data: buffer
      });

      should(parse.firstCall.arg).eql(buffer);

      should(command).have.properties({
        data: data
      });
    });

    it('should set parser and encoder', function() {
      command = new Command(code);

      should(command).have.properties({
        parse: parse,
        encode: encode
      });
    });

    it('should encode message', function() {
      command = new Command(code, {
        sender: sender,
        target: target,

        data: data
      });

      buffer = new Buffer('0E010300000031010A010203', 'hex');

      should(command.message).eql(buffer);
      should(encode.firstCall.arg).eql(data);
    });
  });

  describe('unknown command', function() {
    beforeEach(function() {
      simple.mock(commands, code, undefined);
    });

    it('should not parse data buffer', function() {
      command = new Command(code, {
        data: buffer
      });

      should(command).have.properties({
        data: buffer
      });
    });

    it('should encode message', function() {
      command = new Command(code, {
        sender: sender,
        target: target,

        data: buffer
      });

      buffer = new Buffer('0E010300000031010A010203', 'hex');

      should(command.message).eql(buffer);
    });

    it('should throw error if data is an object', function() {
      command = new Command(code, {
        data: data
      });

      should(function() {
        command.message;
      }).throw('Data encoder for command 0x0031 is not implemented');
    });
  });
});
