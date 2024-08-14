import { TextEncoder, TextDecoder } from 'util';
import 'fake-indexeddb/auto';

Object.assign(global, { TextDecoder, TextEncoder });
