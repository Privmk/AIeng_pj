import { PipelineFactory } from "./PipelineFactory";

export class TranslationPipelineFactory extends PipelineFactory {
    static task = 'translation';
    static model = 'Xenova/nllb-200-distilled-600M';
}


