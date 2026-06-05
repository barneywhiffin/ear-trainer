// create a new class called pinknoiseprocessor that inherits from AWP
// (gets all the methods and properties)
class PinkNoiseProcessor extends AudioWorkletProcessor {

  // the web audio api expects a processor class to provide 2 methods: constructor and process

  constructor() {
    // super() means run the parent class constructor first
    // because an AWP requires setup work from the browser's audio engine
    super();
    // will be filled with Voss-McCartney values
    this.b = [0, 0, 0, 0, 0, 0, 0];
  }

  // the browser's auio engine repeatedly calls processor.process(...)

  process(inputs, outputs, parameters) {

    // structure of audioworklet:
    // outputs[outputIndex][channelIndex][sampleIndex]

    // grab the first output passed to method
    // (gives all channels of the first output)
    const output = outputs[0];

    // each item in output is now a channel
    output.forEach(channel => {
      // go through each sample for the determined length of the channel
      // and obtain semi random value through this algo
      for (let i = 0; i < channel.length; i++) {
        let white = Math.random() * 2 - 1;
        this.b[0] = 0.99886 * this.b[0] + white * 0.0555179;
        this.b[1] = 0.99332 * this.b[1] + white * 0.0750759;
        this.b[2] = 0.96900 * this.b[2] + white * 0.1538520;
        this.b[3] = 0.86650 * this.b[3] + white * 0.3104856;
        this.b[4] = 0.55000 * this.b[4] + white * 0.5329522;
        this.b[5] = -0.7616 * this.b[5] - white * 0.0168980;
        channel[i] = this.b[0] + this.b[1] + this.b[2] + this.b[3] + this.b[4] + this.b[5] + this.b[6] + white * 0.5362;
        channel[i] *= 0.11; // correction factor
        this.b[6] = white * 0.115926;
      }
    });
    return true;
  }
}

// this stores a mapping to our processor in the browser
// (when called)
registerProcessor('pink-noise-processor', PinkNoiseProcessor);