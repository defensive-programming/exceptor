import { Exception, ExceptionLike, designBubble } from './module/excepter.ts';


const bubble = designBubble({
  beforeThrow: (e) => console.error('beforeThrow: ', e),
  willThrow: false,
  shouldLogException: true
})

bubble(new Exception('yo', {}))
