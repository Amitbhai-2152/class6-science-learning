import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const repairs = [
  {
    path: 'chapters/chapter-11.js',
    replacements: [
      [
        '{question:"कौन-सा कथन सही है?",options:["प्राकृतिक संसाधन असीमित हैं","conservation का मतलब कोई resource कभी उपयोग न करना","जल, वायु और मिट्टी जैसे resources जीवन के लिए महत्वपूर्ण हैं","केवल बड़े जानवर महत्वपूर्ण हैं"],answer:2}',
        '{question:"प्राकृतिक संसाधनों और conservation के बारे में कौन-सा कथन सही है?",options:["प्राकृतिक संसाधन असीमित हैं","conservation का मतलब कोई resource कभी उपयोग न करना","जल, वायु और मिट्टी जैसे resources जीवन के लिए महत्वपूर्ण हैं","केवल बड़े जानवर महत्वपूर्ण हैं"],answer:2}'
      ]
    ]
  },
  {
    path: 'subjects/english/english-practice-bank.js',
    replacements: [
      [
        "{question:'Choose the plural form of “child”.',options:['childs','childes','children','childrens'],answer:2,explanation:'“Children” is the irregular plural of “child”.'},",
        "{question:'Choose the plural form of “child”.',options:['childs','childes','children','youngsters'],answer:2,explanation:'“Children” is the irregular plural of “child”; “childrens” is not the standard plural form.'},"
      ],
      [
        "{question:'Choose the correct past tense: “We ___ the museum yesterday.”',options:['visit','visits','visited','will visit'],answer:2,explanation:'“Yesterday” signals past time, so “visited” is correct.'},",
        "{question:'Choose the correct past tense: “We ___ the museum yesterday.”',options:['visit','visits','visited','will visit'],answer:2,explanation:'“Yesterday” signals a completed past action, so the simple-past verb “visited” is required.'},"
      ],
      [
        "{question:'Choose the best word: “The teacher spoke ___ so everyone could understand.”',options:['clear','clearly','clearness','cleared'],answer:1,explanation:'“Clearly” is an adverb describing how the teacher spoke.'},",
        "{question:'Choose the best word: “The teacher spoke ___ so everyone could understand.”',options:['clear','clearly','careless','cleared'],answer:1,explanation:'“Clearly” is the adverb that tells how the teacher spoke; “clear” is an adjective, not the needed adverb here.'},"
      ]
    ]
  },
  {
    path: 'subjects/english/error-correction-bank.js',
    replacements: [
      ["{q:'Choose the correct sentence.',o:['She go to school every day.','She goes to school every day.','She going to school every day.','She gone to school every day.'],a:1,e:'“She” is singular, so the simple-present verb is “goes”.'},", "{q:'Choose the sentence with correct simple-present subject–verb agreement.',o:['She go to school every day.','She goes to school every day.','She going to school every day.','She gone to school every day.'],a:1,e:'“She” is singular, so the simple-present verb is “goes”.'},"],
      ["{q:'Choose the correct sentence.',o:['Riya is my friend. she is kind.','Riya is my friend. She is kind.','Riya is my friend she is kind.','riya is my friend. She is kind.'],a:1,e:'A new sentence begins with a capital letter, so “She” must be capitalized.'},", "{q:'Choose the sentence with correct capitalization and sentence boundaries.',o:['Riya is my friend. she is kind.','Riya is my friend. She is kind.','Riya is my friend she is kind.','riya is my friend. She is kind.'],a:1,e:'A new sentence begins with a capital letter, so “She” must be capitalized.'},"],
      ["{q:'Choose the correct sentence.',o:['The books is on the table.','The books are on the table.','The books am on the table.','The books be on the table.'],a:1,e:'“Books” is plural, so use “are”.'},", "{q:'Choose the sentence with correct plural subject–verb agreement.',o:['The books is on the table.','The books are on the table.','The books am on the table.','The books be on the table.'],a:1,e:'“Books” is plural, so use “are”.'},"],
      ["{q:'Choose the correct pronoun: “Ravi and Aman are ready. ___ will start now.”',o:['He','It','They','She'],a:2,e:'“Ravi and Aman” refers to two people, so “they” is correct.'},", "{q:'Choose the pronoun that correctly replaces two named people: “Ravi and Aman are ready. ___ will start now.”',o:['He','It','They','She'],a:2,e:'“Ravi and Aman” refers to two people, so “they” is correct.'},"],
      ["{q:'Choose the correct sentence.',o:['I am going to school on Monday.','I am going school on Monday.','I going to school on Monday.','I am go to school on Monday.'],a:0,e:'The present continuous form is “am going”; “to school” needs the preposition “to”.'},", "{q:'Choose the correctly formed present-continuous sentence.',o:['I am going to school on Monday.','I am going school on Monday.','I going to school on Monday.','I am go to school on Monday.'],a:0,e:'The present continuous form is “am going”; “to school” needs the preposition “to”.'},"],
      ["{q:'Choose the correct word order.',o:['Always I help my mother.','I always help my mother.','I help always my mother.','Help I always my mother.'],a:1,e:'In this sentence, “always” naturally comes before the main verb “help”.'},", "{q:'Choose the natural adverb placement.',o:['Always I help my mother.','I always help my mother.','I help always my mother.','Help I always my mother.'],a:1,e:'In this sentence, “always” naturally comes before the main verb “help”.'},"],
      ["{q:'Choose the correct sentence.',o:['There is two books.','There are two books.','There am two books.','There be two books.'],a:1,e:'“Two books” is plural, so use “there are”.'},", "{q:'Choose the correct there-is/there-are form for a plural noun.',o:['There is two books.','There are two books.','There am two books.','There be two books.'],a:1,e:'“Two books” is plural, so use “there are”.'},"],
      ["{q:'Choose the correct sentence.',o:['Me and Riya went home.','Riya and I went home.','Riya and me went home.','I and Riya went home.'],a:1,e:'“Riya and I” is the correct subject form in standard school English.'},", "{q:'Choose the correct subject-pronoun form.',o:['Me and Riya went home.','Riya and I went home.','Riya and me went home.','I and Riya went home.'],a:1,e:'“Riya and I” is the correct subject form in standard school English.'},"],
      ["{q:'Choose the correct sentence.',o:['Can you helps me?','Can you help me?','Can you helping me?','Can you helped me?'],a:1,e:'After the modal “can”, use the base verb “help”.'}", "{q:'Choose the correct verb form after the modal “can”.',o:['Can you helps me?','Can you help me?','Can you helping me?','Can you helped me?'],a:1,e:'After the modal “can”, use the base verb “help”.'}"]
    ]
  }
];

let changedFiles = 0;
let totalRepairs = 0;

for (const fileRepair of repairs) {
  let source = fs.readFileSync(fileRepair.path, 'utf8');
  let changed = false;
  for (const [before, after] of fileRepair.replacements) {
    const count = source.split(before).length - 1;
    if (count !== 1) throw new Error(`[question-quality-repair] Expected exactly one match in ${fileRepair.path}, found ${count}: ${before.slice(0, 90)}`);
    source = source.replace(before, after);
    changed = true;
    totalRepairs++;
  }
  if (changed) {
    fs.writeFileSync(fileRepair.path, source);
    changedFiles++;
    console.log(`Repaired ${fileRepair.path}`);
  }
}

if (changedFiles === 0) throw new Error('[question-quality-repair] No files were changed; expected audited defects were not found.');

execFileSync('node', ['--check', 'chapters/chapter-11.js']);
execFileSync('node', ['--check', 'subjects/english/english-practice-bank.js']);
execFileSync('node', ['--check', 'subjects/english/error-correction-bank.js']);

console.log(`[question-quality-repair] Applied ${totalRepairs} targeted educational repairs across ${changedFiles} files.`);
