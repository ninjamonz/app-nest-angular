import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert } from 'firebase-admin/app';

initializeApp({
  credential: cert('./../firebase-adminsdk.json'),
});

async function createUsers() {
  await getAuth().createUser({
    uid: 'f335a69a-8061-457e-97f6-e8e41980b305',
    email: 'just4tesing@gmail.com',
    password: 'password',
  });
  await getAuth().createUser({
    uid: '27295594-1ea4-4a8f-8a16-3b7990f81344',
    email: 'sasukeuchiha@gmail.com',
    password: 'password',
  });
  await getAuth().createUser({
    uid: '09cb58f0-e91d-44f8-b93d-76c17341e156',
    email: 'harunosakura@gmail.com',
    password: 'password',
  });
}

createUsers().catch(console.error);

// npx tsc firebase-migration.ts && node firebase-migration.js
