import { AutomaticSpeechRecognitionPipelineFactory } from "../pipelines/SpeechRecognitionPipelineFactory";

export async function speech_to_text(data) {
    let pipeline = await AutomaticSpeechRecognitionPipelineFactory.getInstance(data => {
        self.postMessage({
            type: 'download',
            task: 'automatic-speech-recognition',
            data: data
        });
    })

    return await pipeline(data.audio, {
        // Choose good defaults for the demo
        chunk_length_s: 30,
        stride_length_s: 5,

        ...data.generation,
        callback_function: function (beams) {
            const decodedText = pipeline.tokenizer.decode(beams[0].output_token_ids, {
                skip_special_tokens: true,
            })

            self.postMessage({
                type: 'update',
                target: data.elementIdToUpdate,
                data: decodedText.trim()
            });
        }
    })
}