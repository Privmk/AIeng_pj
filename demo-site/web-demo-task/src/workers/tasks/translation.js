import { TranslationPipelineFactory } from "../pipelines/TranslationPipelineFactory";


export async function translate(data) {
    let pipeline = await TranslationPipelineFactory.getInstance(data => {
        self.postMessage({
            type: 'download',
            task: 'translation',
            data: data
        });
    })

    // Update task based on source and target languages
    return await pipeline(data.text, { 
        src_lang: data.languageFrom, 
        tgt_lang: data.languageTo,
        ...data.generation,
        callback_function: function (beams) {
            const decodedText = pipeline.tokenizer.decode(beams[0].output_token_ids, {
                skip_special_tokens: true,
            })

            self.postMessage({
                type: 'update',
                target: data.elementIdToUpdate,
                data: decodedText
            });
        }
    })
}