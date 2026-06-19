import { db } from './src/lib/firebase';
import { getDoc, doc } from 'firebase/firestore';

(async () => {
  const p1 = await getDoc(doc(db, 'products', 'p1'));
  console.log(p1.data());
  process.exit(0);
})();
