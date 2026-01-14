    function createMockElevenLabsClient() {
    return {
      textToSpeech: {
         convert: jest.fn(async () => ({
           arrayBuffer: async () =>
             Uint8Array.from([1, 2, 3, 4, 5]).buffer
         }))
      }
    };
  }
  