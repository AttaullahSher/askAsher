/* lang.js — works out how someone writes, instead of asking them to pick from a menu.

   Three things people around here actually type:
     English      "how do I add a product"
     Roman Urdu   "mujhe product add karna hai" — Urdu written in English letters
     Urdu         "مجھے پروڈکٹ ایڈ کرنا ہے"

   Roman Urdu is the one a language picker always gets wrong: the letters are Latin, so every
   detector calls it English, and the reply comes back in English when the person wanted Urdu
   words in Latin letters. So it is matched on vocabulary, not on script. */
const Lang = (() => {

  /* Words that are common in Roman Urdu and rare in English. Kept to ones that do not collide:
     "main" and "to" and "is" are excluded on purpose, they are ordinary English too. */
  const ROMAN_URDU = new Set([
    'aap','ap','tum','tumhara','tumhari','mera','meri','mere','mujhe','mujhy','mujy','hum','humein',
    'kya','kia','kyun','kyu','kiun','kaise','kese','kaisay','kahan','kahaan','kab','kon','kaun',
    'hai','hain','hy','han','haan','nahi','nahin','nai','nhi','nahe',
    'kar','karo','karna','karne','karta','karti','krna','kro','kardo','karden','karein',
    'acha','achha','accha','theek','thik','theak','bilkul','zaroor','zarur','shukriya','shukria',
    'bhai','yaar','sahi','ghalat','matlab','samajh','samjha','samjhao','batao','bataye','bata',
    'chahiye','chahye','chaye','lekin','magar','phir','fir','abhi','ab','sab','kuch','kuchh',
    'bohat','bohot','bahut','buhat','thora','thoda','zyada','ziada','jaldi','asan','aasan',
    'banao','banaya','bana','dekho','dekh','dena','dedo','lena','lelo','milega','milta',
    'hoga','hogi','hota','hoti','raha','rahi','rahe','gaya','gayi','diya','liya','kiya','kya',
    'wala','wali','walay','apna','apni','sath','saath','pehle','baad','andar','bahar',
    'urdu','inshallah','mashallah','alhamdulillah','salam','assalam','walaikum'
  ]);

  const URDU_SCRIPT = /[؀-ۿݐ-ݿ]/;

  const NAMES = {
    en: 'English',
    roman: 'Roman Urdu (Urdu written in English letters)',
    ur: 'Urdu'
  };

  /* Look at one message and say what it is written in. */
  function detect(text) {
    const t = String(text || '').trim();
    if (t.length < 3) return null;

    const urduChars = (t.match(/[؀-ۿ]/g) || []).length;
    if (URDU_SCRIPT.test(t) && urduChars >= 3) return 'ur';

    const words = t.toLowerCase().replace(/[^a-z\s']/g, ' ').split(/\s+/).filter(Boolean);
    if (words.length < 2) return null;

    const hits = words.filter(w => ROMAN_URDU.has(w)).length;
    // two marker words, or one in every four, is enough — Roman Urdu is dense in them
    if (hits >= 2 || hits / words.length >= 0.25) return 'roman';
    return 'en';
  }

  /* What the person has been writing in lately, over the last few messages.
     Recent messages count for more, so switching language mid-chat is picked up quickly. */
  function ofSession(session, fallback = 'en') {
    const msgs = (session?.messages || []).filter(m => m.role === 'user').slice(-5);
    if (!msgs.length) return fallback;

    const score = { en: 0, roman: 0, ur: 0 };
    msgs.forEach((m, i) => {
      const hit = detect(m.content);
      if (hit) score[hit] += i + 1;          // the newest message carries the most weight
    });
    const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
    return best[1] ? best[0] : fallback;
  }

  /* The instruction that goes into the system prompt. */
  function instruction(code) {
    if (code === 'ur') {
      return `They are writing in Urdu script. Reply in Urdu script too. Keep the words ordinary and spoken, not literary Urdu — technical words in English are fine where that is what people actually say.`;
    }
    if (code === 'roman') {
      return `They are writing Roman Urdu — Urdu in English letters. Reply the same way: Urdu words, English letters, the way people text. Do not switch to Urdu script, and do not answer in plain English. Keep technical words in English, as people do.`;
    }
    return `They are writing in English. Reply in English.`;
  }

  /* Whatever the profile has chosen, or what was detected. */
  function forSession(session) {
    const pref = Store.prefs().language || 'auto';
    if (pref !== 'auto') {
      if (/^roman/i.test(pref)) return 'roman';
      if (/^urdu$/i.test(pref)) return 'ur';
      if (/^english$/i.test(pref)) return 'en';
      return null;                            // some other language they typed in themselves
    }
    return ofSession(session, 'en');
  }

  const label = code => NAMES[code] || code;

  return { detect, ofSession, forSession, instruction, label, NAMES };
})();
