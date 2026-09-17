let data=loadData();
let activeTracker=null,trendRangeDays=7,trendMetricId='weight',calendarDate=new Date();

const englishTypes=[
['english_chatgpt','🤖','ChatGPT'],
['english_native','🗣️','Native teacher'],
['english_russian','📘','Russian teacher'],
['english_watching','🎬','Watching']
];

const ENGLISH_WORD_SEEDS=[
  {id:'word_figure_out',kind:'phrasal',level:'B1',title:'figure out',ipa:'/ˈfɪɡər aʊt/',ru:'разобраться, понять',example:'I need to figure out how this API works.',initialDue:true,translationHidden:true,sourcePlan:'b2-chatgpt-week-1'},
  {id:'word_retrieve',kind:'word',level:'B2',title:'retrieve',ipa:'/rɪˈtriːv/',ru:'извлекать, получать обратно',example:'You can retrieve the file from the backup.',initialDue:true},
  {id:'word_particular',kind:'word',level:'B1',title:'particular',ipa:'/pərˈtɪkjələr/',ru:'особенный; конкретный',example:'I am looking for a particular kind of information.',initialDue:false},
  {id:'word_abandon',kind:'word',level:'B1+',title:'abandon',ipa:'/əˈbændən/',ru:'покидать, оставлять; отказываться от',example:'They had to abandon the plan.',initialDue:false},
  {id:'word_cue',kind:'word',level:'B2',title:'cue',ipa:'/kjuː/',ru:'сигнал, подсказка',example:'That was my cue to start speaking.',initialDue:false},
  {id:'word_tailor_made',kind:'phrase',level:'B2',title:'tailor-made',ipa:'/ˌteɪlər ˈmeɪd/',ru:'сделанный специально; идеально подходящий',example:'The course is tailor-made for his goals.',initialDue:false},
  {id:'word_crappy',kind:'word',level:'B1+',title:'crappy',ipa:'/ˈkræpi/',ru:'паршивый, плохой (разговорное)',example:'I had a crappy night of sleep.',initialDue:false},
  {id:'word_put_up_with',kind:'phrasal',level:'B2',title:'put up with',ipa:'/pʊt ˈʌp wɪð/',ru:'терпеть, мириться с',example:'I cannot put up with that noise anymore.',initialDue:true},
  {id:'word_get_into_debt',kind:'phrase',level:'B2',title:'get into debt',ipa:'/ɡet ˌɪntuː ˈdet/',ru:'влезть в долги',example:'It is easy to get into debt if you overspend.',initialDue:true},
  {id:'word_get_cracking',kind:'phrase',level:'B2',title:'get cracking',ipa:'/ɡet ˈkrækɪŋ/',ru:'приниматься за дело, начинать действовать',example:'We have a lot to do, so let’s get cracking.',initialDue:false},
  {id:'word_the_moment',kind:'phrase',level:'B2',title:'the moment',ipa:'/ðə ˈmoʊmənt/',ru:'как только; в тот момент, когда',example:'Call me the moment you arrive.',initialDue:false},
  {id:'word_put_off',kind:'phrasal',level:'B1+',title:'put off',ipa:'/pʊt ˈɔːf/',ru:'откладывать; отталкивать',example:'Do not put off the task until tomorrow.',initialDue:false},
  {id:'word_reluctant',kind:'word',level:'B2',title:'reluctant',ipa:'/rɪˈlʌktənt/',ru:'неохотный, испытывающий нежелание',example:'He was reluctant to ask for help.',initialDue:true},
  {id:'word_overwhelmed',kind:'word',level:'B2',title:'overwhelmed',ipa:'/ˌoʊvərˈwelmd/',ru:'перегруженный, подавленный количеством чего-либо',example:'I felt overwhelmed by the amount of new information.',initialDue:false},
  {id:'word_get_into',kind:'phrasal',level:'B1',title:'get into',ipa:'/ɡet ˈɪntuː/',ru:'увлечься; начать заниматься; попасть в',example:'I want to get into fitness again.',initialDue:false},
  {id:'word_so_far',kind:'phrase',level:'B1',title:'so far',ipa:'/soʊ ˈfɑːr/',ru:'пока что, до настоящего момента',example:'So far, the new routine is working well.',initialDue:false,translationHidden:true,sourcePlan:'b2-chatgpt-week-1'},
  {id:'word_keep_up',kind:'phrasal',level:'B1',title:'keep up',ipa:'/kiːp ʌp/',ru:'поддерживать темп; не отставать',example:'It is hard to keep up when people speak very fast.',initialDue:false,translationHidden:true,sourcePlan:'b2-chatgpt-week-1'},
  {id:'word_motorway',kind:'word',level:'B1',title:'motorway',ipa:'/ˈmoʊtərweɪ/',ru:'автомагистраль',example:'Traffic was heavy on the motorway.',initialDue:false},
  {id:'word_stamina',kind:'word',level:'B2',title:'stamina',ipa:'/ˈstæmɪnə/',ru:'выносливость',example:'Regular exercise can improve your stamina.',initialDue:false},
  {id:'word_retreat',kind:'word',level:'B2',title:'retreat',ipa:'/rɪˈtriːt/',ru:'отступать; уединённое место / ретрит',example:'The group was forced to retreat.',initialDue:false},
  {id:'word_chewing',kind:'word',level:'B1',title:'chewing',ipa:'/ˈtʃuːɪŋ/',ru:'жевание; жующий',example:'Chewing slowly can help you notice when you are full.',initialDue:false},
  {id:"word_give_it_a_go",kind:"phrase",title:"give it a go",ipa:"/ɡɪv ɪt ə ɡəʊ/",ru:"попробовать",example:"I’m not completely sure, but I’ll give it a go.",initialDue:false,translationHidden:true,sourcePlan:"b2-chatgpt-week-1",nzUsage:true},
  {id:"word_make_progress",kind:"phrase",title:"make progress",ipa:"/meɪk ˈprəʊɡres/",ru:"добиваться прогресса",example:"I've been making progress with spontaneous speaking.",initialDue:false,translationHidden:true,sourcePlan:"b2-chatgpt-week-1"},
  {id:"word_settle_in",kind:"phrasal",title:"settle in",ipa:"/ˈsetl ɪn/",ru:"обжиться; освоиться",example:"We've been settling into life in Auckland.",initialDue:false,translationHidden:true,sourcePlan:"b2-chatgpt-week-1",nzUsage:true},
  {id:"word_unless",kind:"word",title:"unless",ipa:"/ənˈles/",ru:"если не; разве что",example:"You won't remember it unless you use it.",initialDue:false,translationHidden:true,sourcePlan:"b2-chatgpt-week-1"},
  {id:"word_otherwise",kind:"word",title:"otherwise",ipa:"/ˈʌðəwaɪz/",ru:"иначе; в противном случае",example:"Practise aloud; otherwise, recognition will not become active speech.",initialDue:false,translationHidden:true,sourcePlan:"b2-chatgpt-week-1"},
  {id:"word_sort_out",kind:"phrasal",title:"sort out",ipa:"/sɔːt aʊt/",ru:"разобраться; уладить",example:"I'll sort out the appointment tomorrow.",initialDue:false,translationHidden:true,sourcePlan:"b2-chatgpt-week-1",nzUsage:true},
  {id:"word_catch_up",kind:"phrasal",title:"catch up",ipa:"/kætʃ ʌp/",ru:"пообщаться после перерыва; наверстать",example:"Let's catch up over coffee this weekend.",initialDue:false,translationHidden:true,sourcePlan:"b2-chatgpt-week-1",nzUsage:true},
  {id:"word_pop_in",kind:"phrasal",title:"pop in",ipa:"/pɒp ɪn/",ru:"ненадолго зайти",example:"I'll pop into the dairy on my way home.",initialDue:false,translationHidden:true,sourcePlan:"b2-chatgpt-week-1",nzUsage:true},
  {id:"word_head_off",kind:"phrasal",title:"head off",ipa:"/hed ɒf/",ru:"отправиться; выдвинуться",example:"We're heading off to the beach early.",initialDue:false,translationHidden:true,sourcePlan:"b2-chatgpt-week-1",nzUsage:true}
];

const ENGLISH_GRAMMAR_SEEDS=[
  {id:'grammar_pp_past',kind:'grammar',group:'grammar',level:'B1',title:'Present Perfect vs Past Simple',
   ruleRu:'Present Perfect связывает прошлое с настоящим. Past Simple говорит о законченном времени в прошлом.',
   ruleEn:'Present Perfect connects a past event with now. Past Simple refers to a finished past time.',
   formula:'have/has + V3  ↔  V2 / did + base verb',
   examples:['I’ve lost my key.','I lost my key yesterday.'],initialDue:false},
  {id:'grammar_pp_ppc',kind:'grammar',group:'grammar',level:'B1+',title:'Present Perfect vs Present Perfect Continuous',shortTitle:'Present Perfect vs PPC',
   ruleRu:'Present Perfect чаще подчёркивает результат, Present Perfect Continuous — длительность или продолжающийся процесс.',
   ruleEn:'Present Perfect often emphasizes a result; Present Perfect Continuous emphasizes duration or an ongoing activity.',
   formula:'have/has + V3  ↔  have/has been + V-ing',
   examples:['I’ve read the report.','I’ve been reading for two hours.'],initialDue:true,focus:true},
  {id:'grammar_past_cont',kind:'grammar',group:'grammar',level:'A2/B1',title:'Past Continuous',
   ruleRu:'Используется для процесса, который шёл в определённый момент в прошлом, часто как фон для другого события.',
   ruleEn:'Use it for an action in progress at a past moment, often as background for another event.',
   formula:'was/were + V-ing',
   examples:['I was studying when she called.'],initialDue:false},
  {id:'grammar_past_perfect',kind:'grammar',group:'grammar',level:'B1',title:'Past Perfect',
   ruleRu:'Показывает, что одно прошлое событие произошло раньше другого прошлого события.',
   ruleEn:'Shows that one past event happened before another past event.',
   formula:'had + V3',
   examples:['The concert had started by the time we arrived.'],initialDue:false},
  {id:'grammar_future_forms',kind:'grammar',group:'grammar',level:'B1',title:'Future forms',
   ruleRu:'Will — решение/прогноз; be going to — план или очевидный прогноз; Present Continuous — договорённость.',
   ruleEn:'Will is common for decisions/predictions; be going to for plans or evidence-based predictions; Present Continuous for arrangements.',
   formula:'will + V1 | be going to + V1 | am/is/are + V-ing',
   examples:['I’ll call you.','I’m going to study tonight.','I’m meeting my teacher tomorrow.'],initialDue:false},
  {id:'grammar_cond_12',kind:'grammar',group:'grammar',level:'B1',title:'First & Second Conditionals',
   ruleRu:'First Conditional — реальная возможная ситуация в будущем. Second Conditional — гипотетическая или маловероятная ситуация.',
   ruleEn:'First Conditional describes a real future possibility. Second Conditional describes a hypothetical or unlikely situation.',
   formula:'If + Present, will + V1 | If + Past, would + V1',
   examples:['If it rains, I’ll stay home.','If I had more time, I would study more.'],initialDue:false},
  {id:'grammar_third_cond',kind:'grammar',group:'grammar',level:'B2',title:'Third Conditional',
   ruleRu:'Используется для нереального прошлого: мы представляем другой результат того, что уже произошло.',
   ruleEn:'Use it for an unreal past: imagining a different result for something that already happened.',
   formula:'If + had + V3, would have + V3',
   examples:['If I had studied more, I would have passed the exam.'],initialDue:false,focus:true},
  {id:'grammar_mixed_cond',kind:'grammar',group:'grammar',level:'B2',title:'Mixed Conditionals',
   ruleRu:'Смешанные условные связывают разные времена: например прошлую причину с настоящим результатом.',
   ruleEn:'Mixed conditionals connect different time frames, such as a past cause with a present result.',
   formula:'If + had + V3, would + V1',
   examples:['If I had gone to bed earlier, I wouldn’t be tired now.'],initialDue:true,focus:true},
  {id:'grammar_unless_otherwise',kind:'grammar',group:'grammar',level:'B1+/B2',title:'Unless & Otherwise',
   ruleRu:'Unless = if not. Otherwise = если этого не сделать / в противном случае.',
   ruleEn:'Unless means if not. Otherwise introduces the consequence if something is not done.',
   formula:'unless + clause | sentence; otherwise, consequence',
   examples:['I won’t go unless you come.','Save the file; otherwise, you may lose it.'],initialDue:false},
  {id:'grammar_wish',kind:'grammar',group:'grammar',level:'B2',title:'Wish / If only / Regret',
   ruleRu:'Wish + Past — недовольство настоящим; wish + had + V3 — сожаление о прошлом.',
   ruleEn:'Wish + Past expresses dissatisfaction with the present; wish + had + V3 expresses regret about the past.',
   formula:'wish + Past | wish + had + V3',
   examples:['I wish I spoke more confidently.','I wish I had started earlier.'],initialDue:false},
  {id:'grammar_passive',kind:'grammar',group:'grammar',level:'B1/B2',title:'Passive Voice',
   ruleRu:'В пассиве важнее действие или результат, чем тот, кто его выполняет. Время выражается через форму be.',
   ruleEn:'In the passive, the action or result is more important than the doer. The tense is carried by the verb be.',
   formula:'be (in the required tense) + V3',
   examples:['The file was deleted.','The request has been sent.'],initialDue:true,focus:true},
  {id:'grammar_reported',kind:'grammar',group:'grammar',level:'B1/B2',title:'Reported Speech',
   ruleRu:'При пересказе прошлой речи часто происходит backshift: Present → Past, Past → Past Perfect, will → would.',
   ruleEn:'When reporting past speech, tenses often backshift: Present → Past, Past → Past Perfect, will → would.',
   formula:'He said (that) ...',
   examples:['She said, “I am tired.” → She said that she was tired.'],initialDue:true},
  {id:'grammar_gerund_inf',kind:'grammar',group:'grammar',level:'B1/B2',title:'Gerunds & Infinitives',
   ruleRu:'Некоторые глаголы требуют -ing, другие to + infinitive. После suggest/mention используется -ing; после want/decide обычно to + infinitive.',
   ruleEn:'Some verbs take -ing, others take to + infinitive. Suggest/mention take -ing; want/decide usually take to + infinitive.',
   formula:'verb + V-ing | verb + to + V1',
   examples:['How about going out?','She mentioned meeting him.','I decided to leave.'],initialDue:true,focus:true},
  {id:'grammar_modals',kind:'grammar',group:'grammar',level:'B1/B2',title:'Modal verbs',
   ruleRu:'Modal verbs выражают обязанность, вероятность, совет, возможность и предположение.',
   ruleEn:'Modal verbs express obligation, probability, advice, possibility and deduction.',
   formula:'modal + base verb',
   examples:['You must leave.','You don’t have to come.','He might be busy.'],initialDue:false},
  {id:'grammar_articles',kind:'grammar',group:'grammar',level:'B1',title:'Articles',
   ruleRu:'A/an вводит один неопределённый объект; the указывает на конкретный или уже известный объект; иногда артикль не нужен.',
   ruleEn:'A/an introduces one non-specific item; the points to a specific or known item; sometimes no article is used.',
   formula:'a/an | the | Ø',
   examples:['I saw a dog. The dog was friendly.'],initialDue:false},
  {id:'grammar_relative',kind:'grammar',group:'grammar',level:'B1/B2',title:'Relative clauses',
   ruleRu:'Who — люди, which — вещи, that — люди/вещи в defining clauses. Non-defining clauses отделяются запятыми.',
   ruleEn:'Who is for people, which for things, and that for people/things in defining clauses. Non-defining clauses use commas.',
   formula:'noun + who/which/that + clause',
   examples:['The person who called me was my teacher.'],initialDue:false},
  {id:'grammar_for_since',kind:'grammar',group:'grammar',level:'B1',title:'For & Since with perfect tenses',
   ruleRu:'For показывает длительность, since — точку начала.',
   ruleEn:'For introduces a duration; since introduces the starting point.',
   formula:'for + period | since + starting point',
   examples:['I’ve lived here for two years.','I’ve lived here since 2024.'],initialDue:false},
  {id:'grammar_linking',kind:'grammar',group:'skill',level:'B1/B2',title:'Linking words & logic',
   ruleRu:'Связки показывают отношение между идеями: contrast, result, addition, condition.',
   ruleEn:'Linking words show the relationship between ideas: contrast, result, addition and condition.',
   formula:'however | therefore | although | unless | otherwise | in addition',
   examples:['I was tired; however, I finished the task.'],initialDue:false},
  {id:'grammar_complex_ing',kind:'grammar',group:'structure',level:'B2',title:'What I like most is + -ing',
   ruleRu:'После конструкции What I like most is естественно использовать герундий, когда речь об активности.',
   ruleEn:'After What I like most is, use a gerund naturally when referring to an activity.',
   formula:'What I like most is + V-ing',
   examples:['What I like most is learning through conversation.'],initialDue:false},
  {id:'grammar_prepositions',kind:'grammar',group:'grammar',level:'B1',title:'Next to vs In front of',
   ruleRu:'Next to = рядом, сбоку. In front of = перед чем-то.',
   ruleEn:'Next to means beside. In front of means positioned before something.',
   formula:'next to ≠ in front of',
   examples:['The café is next to the bank.','The car is in front of the house.'],initialDue:false},
  {id:'grammar_question_tags',kind:'grammar',group:'grammar',level:'B1',title:'Question tags',
   ruleRu:'После утвердительного предложения обычно идёт отрицательный tag и наоборот.',
   ruleEn:'A positive statement usually takes a negative question tag, and vice versa.',
   formula:'You are ready, aren’t you?',
   examples:['She can swim, can’t she?'],initialDue:false},
  {id:'grammar_used_to',kind:'grammar',group:'grammar',level:'B1',title:'Used to / Be used to / Get used to',
   ruleRu:'Used to + V1 — привычка в прошлом. Be used to + noun/-ing — быть привыкшим. Get used to — привыкать.',
   ruleEn:'Used to + base verb is a past habit. Be used to + noun/-ing means be accustomed. Get used to means become accustomed.',
   formula:'used to + V1 | be/get used to + noun/V-ing',
   examples:['I used to smoke.','I’m used to waking up early.'],initialDue:false},
  {id:'skill_word_formation',kind:'grammar',group:'skill',level:'B2',title:'Word formation',
   ruleRu:'Учись распознавать семейства слов и менять часть речи с помощью суффиксов и приставок.',
   ruleEn:'Learn to recognize word families and change word class with prefixes and suffixes.',
   formula:'decide → decision | possible → impossible',
   examples:['The decision was difficult.'],initialDue:false},
  {id:'skill_paraphrasing',kind:'grammar',group:'skill',level:'B2',title:'Paraphrasing',
   ruleRu:'Передавай ту же мысль другими словами, сохраняя смысл и грамматику.',
   ruleEn:'Express the same idea in different words while preserving the meaning.',
   formula:'same meaning → different structure',
   examples:['I started here two years ago. → I’ve worked here for two years.'],initialDue:false},
  {id:'skill_implied',kind:'grammar',group:'skill',level:'B2',title:'Implied meaning & abstract discussion',
   ruleRu:'На B2 важно понимать не только буквальные слова, но и подразумеваемый смысл, отношение говорящего и аргументацию.',
   ruleEn:'At B2, understand not only literal words but also implied meaning, speaker attitude and argumentation.',
   formula:'context + tone + wording → intended meaning',
   examples:['“That’s one way to do it.” can imply doubt rather than approval.'],initialDue:false}
];

const ENGLISH_MISTAKE_SEEDS=[
  {id:'mistake_did_recognized',kind:'mistake',level:'B1',title:"I didn’t recognized him at first.",correct:"I didn’t recognize him at first.",ruleRu:'После did / didn’t используется базовая форма глагола.',ruleEn:'After did / didn’t, use the base form of the verb.',initialDue:true},
  {id:'mistake_seen',kind:'mistake',level:'B1',title:'When I seen her at the party, I remembered that we had met before.',correct:'When I saw her at the party, I remembered that we had met before.',ruleRu:'Past Simple от see — saw. Seen используется как V3 после have/had.',ruleEn:'The Past Simple of see is saw. Seen is the past participle used after have/had.',initialDue:true},
  {id:'mistake_forget_goes',kind:'mistake',level:'B1',title:'I had forget my passport at home, so I goes back to get it.',correct:'I had forgotten my passport at home, so I went back to get it.',ruleRu:'Past Perfect = had + V3; Past Simple от go — went.',ruleEn:'Past Perfect = had + past participle; the Past Simple of go is went.',initialDue:false},
  {id:'mistake_realize',kind:'mistake',level:'B1',title:'After we had left the restaurant, I realize that I had forgotten my wallet.',correct:'After we had left the restaurant, I realized that I had forgotten my wallet.',ruleRu:'Основное повествование в прошлом требует Past Simple: realized.',ruleEn:'The main past narrative needs Past Simple here: realized.',initialDue:false},
  {id:'mistake_fallen_exam',kind:'mistake',level:'B1',title:"He hadn’t studied enough before the exam, so he fallen it.",correct:"He hadn’t studied enough before the exam, so he failed it.",ruleRu:'Экзамен можно fail (провалить). Fallen — V3 от fall и здесь не подходит.',ruleEn:'You can fail an exam. Fallen is the past participle of fall and does not fit here.',initialDue:true},
  {id:'mistake_turned_odd',kind:'mistake',level:'B1',title:"My phone turned odd because I hadn’t charged it the night before.",correct:"My phone turned off because I hadn’t charged it the night before.",ruleRu:'Turn off = выключиться. Odd = странный.',ruleEn:'Turn off means stop operating. Odd means strange.',initialDue:false},
  {id:'mistake_by_time',kind:'mistake',level:'B1',title:'By the time I had already left, they arrived.',correct:'By the time they arrived, I had already left.',ruleRu:'После by the time ставим событие-ориентир; более раннее действие выражаем Past Perfect.',ruleEn:'After by the time, place the reference event; use Past Perfect for the earlier action.',initialDue:false}
];


const ENGLISH_WEEK_PLAN={"schemaVersion":1,"planId":"b2-chatgpt-week-1","title":{"en":"B2 ChatGPT Grammar Plan — Week 1","ru":"План грамматики B2 с ChatGPT — неделя 1"},"level":"B1 to B2","totalMinutes":240,"sessionsPerWeek":4,"translationDisplay":"hidden_until_tap","method":["targeted_diagnosis","active_recall","spaced_review","controlled_to_free_practice"],"sessions":[{"id":"session-1","durationMinutes":60,"topic":"Gerunds and infinitives","mainFocus":"Choose -ing or to + verb after common verbs and expressions.","blocks":[{"minutes":5,"type":"diagnostic","instruction":"Complete five sentences without checking the rule."},{"minutes":12,"type":"explanation","instruction":"Study the patterns and compare the examples."},{"minutes":18,"type":"controlled_practice","instruction":"Complete Exercises 1 and 2."},{"minutes":15,"type":"speaking","instruction":"Answer the prompts aloud using the target patterns."},{"minutes":10,"type":"review","instruction":"Correct mistakes and save three personal examples."}],"rules":[{"rule":"Use verb + -ing after enjoy, avoid, mention, suggest, finish and keep.","examples":["I enjoy speaking English.","She mentioned moving to Auckland."]},{"rule":"Use verb + to-infinitive after decide, hope, plan, want, need and promise.","examples":["I plan to apply for jobs.","We decided to stay in New Zealand."]},{"rule":"Use -ing after prepositions and expressions such as How about... ?","examples":["How about practising after dinner?","I'm interested in improving my pronunciation."]}],"exercises":[{"id":"1a","type":"fill_gap","instruction":"Use the correct form of the verb in brackets.","items":[{"prompt":"I avoid ___ English only in class. (speak)","answer":"speaking"},{"prompt":"We decided ___ a different course. (try)","answer":"to try"},{"prompt":"How about ___ the answer again? (explain)","answer":"explaining"},{"prompt":"He mentioned ___ late. (arrive)","answer":"arriving"},{"prompt":"I hope ___ more confidently soon. (speak)","answer":"to speak"}]},{"id":"1b","type":"personal_speaking","instruction":"Answer aloud in two or three sentences.","items":[{"prompt":"What do you enjoy doing in Auckland?","target":"enjoy + -ing"},{"prompt":"What do you plan to do when your English reaches B2?","target":"plan + to-infinitive"},{"prompt":"Suggest an English activity for tonight.","target":"How about + -ing"}]}],"vocabulary":[{"term":"figure out","ipa":"/ˈfɪɡə aʊt/","translationRu":"разобраться; понять","translationHidden":true,"example":"I’m trying to figure out which form sounds right."},{"term":"keep up","ipa":"/kiːp ʌp/","translationRu":"поддерживать темп; не отставать","translationHidden":true,"example":"It is easier to keep up when I study regularly."},{"term":"give it a go","ipa":"/ɡɪv ɪt ə ɡəʊ/","translationRu":"попробовать","translationHidden":true,"nzUsage":true,"example":"I’m not completely sure, but I’ll give it a go."}]},{"id":"session-2","durationMinutes":60,"topic":"Present Perfect vs Present Perfect Continuous","mainFocus":"Contrast completed results with duration or ongoing activity.","blocks":[{"minutes":8,"type":"spaced_review","instruction":"Recall Session 1 patterns and say three examples."},{"minutes":12,"type":"explanation","instruction":"Compare result, duration and repeated activity."},{"minutes":15,"type":"controlled_practice","instruction":"Complete Exercise 2a."},{"minutes":15,"type":"speaking","instruction":"Describe your life and English study using both tenses."},{"minutes":10,"type":"correction","instruction":"Ask ChatGPT for direct corrections and repeat each corrected sentence."}],"rules":[{"rule":"Use Present Perfect for a result, completed amount or life experience.","examples":["I've completed four lessons this week.","I've lived in three countries."]},{"rule":"Use Present Perfect Continuous for duration, an unfinished activity or visible recent activity.","examples":["I've been studying for two hours.","It's wet because it has been raining."]},{"rule":"Some state verbs normally use the simple form, not the continuous form.","examples":["I've known her for ten years.","I've wanted to improve my English for a long time."]}],"exercises":[{"id":"2a","type":"choose_tense","instruction":"Complete each sentence with the best tense.","items":[{"prompt":"I ___ three grammar exercises today. (finish)","answer":"have finished"},{"prompt":"I ___ English since breakfast. (study)","answer":"have been studying"},{"prompt":"How long ___ you ___ in Auckland? (live)","answer":"have you been living"},{"prompt":"I ___ that word several times this week. (use)","answer":"have used"},{"prompt":"She ___ him since university. (know)","answer":"has known"}]},{"id":"2b","type":"personal_speaking","instruction":"Speak for two minutes. Include at least two examples of each tense.","prompt":"What have you achieved since moving to New Zealand, and what have you been working on recently?"}],"vocabulary":[{"term":"so far","ipa":"/səʊ fɑː/","translationRu":"пока что; к настоящему моменту","translationHidden":true,"example":"I've studied for four hours so far this week."},{"term":"make progress","ipa":"/meɪk ˈprəʊɡres/","translationRu":"добиваться прогресса","translationHidden":true,"example":"I've been making progress with spontaneous speaking."},{"term":"settle in","ipa":"/ˈsetl ɪn/","translationRu":"обжиться; освоиться","translationHidden":true,"nzUsage":true,"example":"We've been settling into life in Auckland."}]},{"id":"session-3","durationMinutes":60,"topic":"Conditionals with unless and otherwise","mainFocus":"Express real and hypothetical consequences accurately.","blocks":[{"minutes":8,"type":"spaced_review","instruction":"Review two errors from Sessions 1 and 2."},{"minutes":12,"type":"explanation","instruction":"Compare first, second and third conditionals."},{"minutes":18,"type":"controlled_practice","instruction":"Complete Exercises 3a and 3b."},{"minutes":15,"type":"speaking","instruction":"Answer hypothetical questions without writing first."},{"minutes":7,"type":"review","instruction":"Build a three-card error review set."}],"rules":[{"rule":"First conditional: if/unless + present, will + base verb for a realistic future result.","examples":["If I practise daily, I'll improve.","I won't improve unless I speak regularly."]},{"rule":"Second conditional: if + past, would + base verb for a hypothetical present or future.","examples":["If I had more confidence, I would speak more."]},{"rule":"Third conditional: if + past perfect, would have + past participle for an unreal past.","examples":["If I had practised earlier, I would have felt calmer."]},{"rule":"Otherwise introduces the consequence if the previous action does not happen.","examples":["Write the phrase down; otherwise, you may forget it."]}],"exercises":[{"id":"3a","type":"rewrite","instruction":"Rewrite without changing the meaning.","items":[{"prompt":"If I don't practise speaking, I won't become confident. Use unless.","answer":"I won't become confident unless I practise speaking."},{"prompt":"Leave now, or you will miss the bus. Use otherwise.","answer":"Leave now; otherwise, you will miss the bus."},{"prompt":"I didn't prepare, so I felt nervous. Use the third conditional.","answer":"If I had prepared, I wouldn't have felt nervous."}]},{"id":"3b","type":"personal_speaking","instruction":"Answer aloud and explain why.","items":[{"prompt":"What will happen if you practise speaking every day?","target":"first conditional"},{"prompt":"What would you do if you got a job interview tomorrow?","target":"second conditional"},{"prompt":"What would have been different if you had started speaking practice earlier?","target":"third conditional"}]}],"vocabulary":[{"term":"unless","ipa":"/ənˈles/","translationRu":"если не; разве что","translationHidden":true,"example":"You won't remember it unless you use it."},{"term":"otherwise","ipa":"/ˈʌðəwaɪz/","translationRu":"иначе; в противном случае","translationHidden":true,"example":"Practise aloud; otherwise, recognition will not become active speech."},{"term":"sort out","ipa":"/sɔːt aʊt/","translationRu":"разобраться; уладить","translationHidden":true,"nzUsage":true,"example":"I'll sort out the appointment tomorrow."}]},{"id":"session-4","durationMinutes":60,"topic":"Integrated grammar for spontaneous speaking","mainFocus":"Retrieve this week's grammar quickly in realistic New Zealand situations.","blocks":[{"minutes":10,"type":"weekly_recall","instruction":"Explain the three grammar topics without looking at notes."},{"minutes":15,"type":"mixed_test","instruction":"Complete Exercise 4a."},{"minutes":20,"type":"role_play","instruction":"Role-play a job interview, café conversation and phone call with ChatGPT."},{"minutes":10,"type":"correction_loop","instruction":"Repeat corrected sentences, then change one detail in each."},{"minutes":5,"type":"reflection","instruction":"Mark each topic: Know, Hard or Again."}],"exercises":[{"id":"4a","type":"mixed_review","instruction":"Correct the errors. For the ongoing-activity item, rewrite it to emphasise duration.","items":[{"prompt":"I enjoy to speak with native speakers.","answer":"I enjoy speaking with native speakers."},{"prompt":"Emphasise the ongoing activity: I have studied for two hours and I am not finished yet.","answer":"I've been studying for two hours and I'm not finished yet."},{"prompt":"Unless I will practise, I won't improve.","answer":"Unless I practise, I won't improve."},{"prompt":"If I would have more confidence, I would apply now.","answer":"If I had more confidence, I would apply now."},{"prompt":"She mentioned to move to Wellington.","answer":"She mentioned moving to Wellington."}]},{"id":"4b","type":"role_play","instruction":"Speak immediately. Do not write a script.","items":[{"prompt":"A recruiter asks what you have been doing since moving to New Zealand.","target":"perfect tenses"},{"prompt":"A friend asks what you would do if you received two job offers.","target":"second conditional"},{"prompt":"Suggest a weekend activity in Auckland.","target":"suggest or How about + -ing"}]}],"vocabulary":[{"term":"catch up","ipa":"/kætʃ ʌp/","translationRu":"пообщаться после перерыва; наверстать","translationHidden":true,"nzUsage":true,"example":"Let's catch up over coffee this weekend."},{"term":"pop in","ipa":"/pɒp ɪn/","translationRu":"ненадолго зайти","translationHidden":true,"nzUsage":true,"example":"I'll pop into the dairy on my way home."},{"term":"head off","ipa":"/hed ɒf/","translationRu":"отправиться; выдвинуться","translationHidden":true,"nzUsage":true,"example":"We're heading off to the beach early."}]}],"weeklySuccessCriteria":["Complete all four sessions.","Score at least 80 percent on the mixed review after corrections.","Use six target structures during unscripted speaking.","Recall at least eight new expressions without revealing the translation.","Save no more than five recurring errors for next week's spaced review."],"appUiSuggestions":{"lessonStatusLabels":["New","Learning","Review","Confident"],"exerciseActions":["Check","Try again","Show rule"],"vocabularyActions":["Reveal translation","Play pronunciation","Add example"],"completionAction":"Finish lesson"}};
const ENGLISH_WEEK_PLAN_GRAMMAR_REFS={"session-1":["grammar_gerund_inf"],"session-2":["grammar_pp_ppc"],"session-3":["grammar_cond_12","grammar_third_cond","grammar_unless_otherwise"],"session-4":["grammar_gerund_inf","grammar_pp_ppc","grammar_cond_12","grammar_third_cond","grammar_unless_otherwise"]};
const ENGLISH_WEEK_PLAN_WORD_IDS={"session-1":["word_figure_out","word_keep_up","word_give_it_a_go"],"session-2":["word_so_far","word_make_progress","word_settle_in"],"session-3":["word_unless","word_otherwise","word_sort_out"],"session-4":["word_catch_up","word_pop_in","word_head_off"]};

const ENGLISH_FOCUS_IDS=[
  'grammar_gerund_inf',
  'grammar_pp_ppc',
  'grammar_mixed_cond',
  'grammar_passive'
];

const ENGLISH_PRACTICE_BANK={
  grammar_gerund_inf:[
    {
      q:'How about ___ to the gym after work?',
      options:['go','going','to go','went'],
      answer:1,
      ru:'После How about используется форма V-ing.',
      en:'After “How about”, use the -ing form.'
    },
    {
      q:'She mentioned ___ him at the conference.',
      options:['meet','meeting','to meet','met'],
      answer:1,
      ru:'После mention обычно используется V-ing.',
      en:'“Mention” is normally followed by the -ing form.'
    },
    {
      q:'I decided ___ earlier tomorrow.',
      options:['leaving','leave','to leave','left'],
      answer:2,
      ru:'После decide обычно используется to + infinitive.',
      en:'“Decide” is normally followed by to + infinitive.'
    },
    {
      q:'I really enjoy ___ in English.',
      options:['speak','speaking','to spoke','spoke'],
      answer:1,
      ru:'После enjoy используется V-ing.',
      en:'“Enjoy” is followed by the -ing form.'
    },
    {
      q:'We agreed ___ at 6 p.m.',
      options:['meeting','meet','to meet','met'],
      answer:2,
      ru:'После agree используется to + infinitive.',
      en:'“Agree” is followed by to + infinitive.'
    }
  ],
  grammar_pp_ppc:[
    {
      q:'I ___ the report, so you can read the final version now.',
      options:['have finished','have been finishing','am finishing','finished since morning'],
      answer:0,
      ru:'Здесь важен завершённый результат — готовый отчёт.',
      en:'The completed result matters here: the report is finished.'
    },
    {
      q:'My hands are covered in paint because I ___.',
      options:['have painted the wall twice','have been painting the wall','painted the wall since two hours','have been painted the wall'],
      answer:1,
      ru:'Видимый результат длительного недавнего процесса → Present Perfect Continuous.',
      en:'Visible evidence of a recent ongoing activity points to Present Perfect Continuous.'
    },
    {
      q:'I ___ three chapters today.',
      options:['have read','have been read','have been reading three chapters','am read'],
      answer:0,
      ru:'Количество завершённых единиц подчёркивает результат.',
      en:'A completed quantity emphasizes result, so Present Perfect fits.'
    },
    {
      q:'He ___ for forty minutes, and he is still outside.',
      options:['has waited yesterday','has been waiting','has wait','was waiting since'],
      answer:1,
      ru:'Длительность продолжающегося действия → Present Perfect Continuous.',
      en:'Duration of an activity that is still continuing calls for Present Perfect Continuous.'
    },
    {
      q:'I ___ the email already.',
      options:['have already sent','have already been sending','am already sent','have send already'],
      answer:0,
      ru:'Already + завершённый результат → Present Perfect.',
      en:'“Already” with a completed result naturally uses Present Perfect.'
    }
  ],
  grammar_mixed_cond:[
    {
      q:'If I had gone to bed earlier, I ___ so tired now.',
      options:["wouldn't be","wouldn't have been","won't be","am not"],
      answer:0,
      ru:'Прошлая причина влияет на настоящее: had + V3 → would + V1.',
      en:'A past cause affects the present: had + past participle → would + base verb.'
    },
    {
      q:'If she were more organized, she ___ yesterday’s deadline.',
      options:["wouldn't miss","wouldn't have missed","won't have missed","hadn't missed"],
      answer:1,
      ru:'Настоящее качество связано с прошлым результатом: Past → would have + V3.',
      en:'A present condition is linked to a past result: Past → would have + past participle.'
    },
    {
      q:'If we had saved more money, we ___ the trip now.',
      options:['could afford','could have afforded yesterday only','can afforded','would afforded'],
      answer:0,
      ru:'Прошлое решение влияет на нынешнюю возможность.',
      en:'A past action affects a present possibility.'
    },
    {
      q:'If he spoke English more confidently, he ___ the job last year.',
      options:['might get','might have got','will have got','had got'],
      answer:1,
      ru:'Настоящая характеристика связывается с возможным прошлым результатом.',
      en:'A present characteristic is linked to a possible past result.'
    },
    {
      q:"If I hadn't moved to New Zealand, I ___ in Auckland now.",
      options:["wouldn't be living","wouldn't have lived","won't live","hadn't lived"],
      answer:0,
      ru:'Прошлое событие определяет нынешнюю ситуацию.',
      en:'A past event determines the present situation.'
    }
  ],
  grammar_passive:[
    {
      q:'The request ___ yesterday.',
      options:['sent','was sent','has send','was sending by itself'],
      answer:1,
      ru:'Past Simple Passive = was/were + V3.',
      en:'Past Simple Passive = was/were + past participle.'
    },
    {
      q:'The file ___, so we need to restore it from backup.',
      options:['has been deleted','has deleted','was deleting','is delete'],
      answer:0,
      ru:'Present Perfect Passive = has/have been + V3.',
      en:'Present Perfect Passive = has/have been + past participle.'
    },
    {
      q:'The tickets ___ by email tomorrow.',
      options:['will send','will be sent','are sending','will sent'],
      answer:1,
      ru:'Future Simple Passive = will be + V3.',
      en:'Future Simple Passive = will be + past participle.'
    },
    {
      q:'English ___ in New Zealand.',
      options:['speaks','is spoken','is speaking by people only now','spoken'],
      answer:1,
      ru:'Для общего факта в пассиве: Present Simple Passive = am/is/are + V3.',
      en:'For a general fact, Present Simple Passive = am/is/are + past participle.'
    },
    {
      q:'The problem ___ right now.',
      options:['is being investigated','is investigated yesterday','has investigating','being investigate'],
      answer:0,
      ru:'Процесс прямо сейчас → Present Continuous Passive = am/is/are being + V3.',
      en:'An action in progress now uses Present Continuous Passive = am/is/are being + past participle.'
    }
  ]
};

function englishPracticeQuestions(id){
  return ENGLISH_PRACTICE_BANK[id]||[];
}
function englishHasPractice(id){
  return englishPracticeQuestions(id).length>0;
}

let englishLearningView='words';
let englishLearningParent='words';
let englishLearningItemId='';
let englishWordFilter='all';
let englishWordSearch='';
let englishReviewQueueIds=[];
let englishReviewInitialTotal=0;
let englishReviewAnswerShown=false;

let englishPracticeItemId='';
let englishPracticeIndex=0;
let englishPracticeScore=0;
let englishPracticeAnswered=false;
let englishPracticeSelected=-1;
let englishPlanSessionId='';
let englishPlanTranslationReveals=new Set();
let englishPlanAnswerReveals=new Set();
let englishPlanDraftSaveTimer=null;
let englishWordTranslationReveals=new Set();

function englishLearningStore(){
  if(!data.englishLearning || typeof data.englishLearning!=='object'){
    data.englishLearning={customItems:[],review:{},favorites:{},dailyQueue:{date:'',itemIds:[],newItemIds:[]}};
  }
  if(!Array.isArray(data.englishLearning.customItems))data.englishLearning.customItems=[];
  if(!data.englishLearning.review || typeof data.englishLearning.review!=='object')data.englishLearning.review={};
  if(!data.englishLearning.favorites || typeof data.englishLearning.favorites!=='object')data.englishLearning.favorites={};
  if(!data.englishLearning.dailyQueue || typeof data.englishLearning.dailyQueue!=='object'){
    data.englishLearning.dailyQueue={date:'',itemIds:[],newItemIds:[]};
  }
  if(typeof data.englishLearning.dailyQueue.date!=='string')data.englishLearning.dailyQueue.date='';
  if(!Array.isArray(data.englishLearning.dailyQueue.itemIds))data.englishLearning.dailyQueue.itemIds=[];
  if(!Array.isArray(data.englishLearning.dailyQueue.newItemIds))data.englishLearning.dailyQueue.newItemIds=[];
  if(!data.englishLearning.studyPlans || typeof data.englishLearning.studyPlans!=='object')data.englishLearning.studyPlans={};
  return data.englishLearning;
}

function englishStudyPlanProgress(planId=ENGLISH_WEEK_PLAN.planId){
  const store=englishLearningStore();
  if(!store.studyPlans[planId] || typeof store.studyPlans[planId]!=='object'){
    store.studyPlans[planId]={lessons:{}};
  }
  if(!store.studyPlans[planId].lessons || typeof store.studyPlans[planId].lessons!=='object'){
    store.studyPlans[planId].lessons={};
  }
  return store.studyPlans[planId];
}
function englishPlanLessonState(sessionId){
  const planState=englishStudyPlanProgress();
  if(!planState.lessons[sessionId] || typeof planState.lessons[sessionId]!=='object'){
    planState.lessons[sessionId]={status:'New',startedAt:'',completedAt:''};
  }
  return planState.lessons[sessionId];
}
function englishPlanSession(sessionId){return ENGLISH_WEEK_PLAN.sessions.find(s=>s.id===sessionId)||null}
function englishPlanCompletedCount(){
  return ENGLISH_WEEK_PLAN.sessions.filter(s=>!!englishPlanLessonState(s.id).completedAt).length;
}
function englishPlanStatusLabel(status){
  const ru={New:'Новое',Learning:'Изучаю',Review:'Повторение',Confident:'Уверенно'};
  return (data.language||'ru')==='en'?status:(ru[status]||status);
}
function englishPlanMethodLabel(method){
  const labels={
    targeted_diagnosis:['Точечная диагностика','Targeted diagnosis'],
    active_recall:['Активное вспоминание','Active recall'],
    spaced_review:['Интервальное повторение','Spaced review'],
    controlled_to_free_practice:['От контролируемой к свободной практике','Controlled → free practice']
  };
  const x=labels[method]||[method,method];
  return trText(x[0],x[1]);
}
function englishPlanBlockLabel(type){
  const map={
    diagnostic:['Диагностика','Diagnostic'], explanation:['Разбор','Explanation'],
    controlled_practice:['Упражнения','Controlled practice'], speaking:['Говорение','Speaking'],
    review:['Повторение','Review'], spaced_review:['Интервальное повторение','Spaced review'],
    correction:['Коррекция','Correction'], weekly_recall:['Недельное вспоминание','Weekly recall'],
    mixed_test:['Смешанный тест','Mixed test'], role_play:['Ролевая практика','Role-play'],
    correction_loop:['Цикл коррекции','Correction loop'], reflection:['Рефлексия','Reflection']
  };
  const x=map[type]||[type,type]; return trText(x[0],x[1]);
}
function openEnglishWeekPlan(){
  englishLearningView='plan';
  englishPlanSessionId='';
  document.getElementById('englishLearningModal')?.classList.add('show');
  document.body.style.overflow='hidden';
  renderEnglishLearning();
}
function openEnglishPlanLesson(sessionId){
  const session=englishPlanSession(sessionId); if(!session)return;
  englishPlanSessionId=sessionId;
  englishPlanAnswerReveals.clear();
  englishPlanTranslationReveals.clear();
  englishLearningView='lesson';
  const state=englishPlanLessonState(sessionId);
  if(!state.startedAt){state.startedAt=new Date().toISOString()}
  if(!state.status || state.status==='New')state.status='Learning';
  persistData({renderAfter:true,makeSnapshot:true});
  renderEnglishLearning();
}
function setEnglishPlanLessonStatus(sessionId,status){
  if(!ENGLISH_WEEK_PLAN.appUiSuggestions.lessonStatusLabels.includes(status))return;
  const state=englishPlanLessonState(sessionId);
  state.status=status;
  if(status==='New'){state.startedAt='';state.completedAt=''}
  if(status!=='New' && !state.startedAt)state.startedAt=new Date().toISOString();
  persistData({renderAfter:true,makeSnapshot:true});
  renderEnglishLearning();
}
function finishEnglishPlanLesson(sessionId){
  const state=englishPlanLessonState(sessionId);
  state.completedAt=state.completedAt||new Date().toISOString();
  if(state.status!=='Confident')state.status='Review';
  persistData({renderAfter:true,makeSnapshot:true});
  renderEnglishLearning();
}
function englishPlanTranslationKey(sessionId,index){return `${sessionId}:vocab:${index}`}
function toggleEnglishPlanTranslation(sessionId,index){
  const key=englishPlanTranslationKey(sessionId,index);
  if(englishPlanTranslationReveals.has(key))englishPlanTranslationReveals.delete(key);else englishPlanTranslationReveals.add(key);
  renderEnglishLearning();
}
function englishPlanAnswerKey(sessionId,exerciseId,index){return `${sessionId}:${exerciseId}:${index}`}
function saveEnglishPlanAnswer(sessionId,exerciseId,index,value){
  const session=englishPlanSession(sessionId);
  const exercise=session?.exercises?.find(x=>x.id===exerciseId);
  if(!exercise?.items?.[index] || typeof exercise.items[index].answer!=='string')return;
  const state=englishPlanLessonState(sessionId);
  if(!state.answers || typeof state.answers!=='object')state.answers={};
  state.answers[englishPlanAnswerKey(sessionId,exerciseId,index)]=String(value);
  // Save locally on every edit, without rebuilding the focused input.
  stampCurrentData();
  writeLocalCopies(data);
  clearTimeout(englishPlanDraftSaveTimer);
  englishPlanDraftSaveTimer=setTimeout(flushEnglishPlanDraft,400);
}
function flushEnglishPlanDraft(){
  if(englishPlanDraftSaveTimer===null)return;
  clearTimeout(englishPlanDraftSaveTimer);
  englishPlanDraftSaveTimer=null;
  writeVaultCopies(structuredClone(data),false).catch(err=>console.warn('Lesson draft recovery write failed',err));
}
function toggleEnglishPlanAnswer(sessionId,exerciseId,index){
  const key=englishPlanAnswerKey(sessionId,exerciseId,index);
  if(englishPlanAnswerReveals.has(key))englishPlanAnswerReveals.delete(key);else englishPlanAnswerReveals.add(key);
  renderEnglishLearning();
}
function toggleEnglishWordTranslation(id){
  if(englishWordTranslationReveals.has(id))englishWordTranslationReveals.delete(id);else englishWordTranslationReveals.add(id);
  renderEnglishLearning();
}
function renderEnglishPlanExercise(session,exercise){
  const instruction=escapeHTML(exercise.instruction||'');
  let body='';
  if(Array.isArray(exercise.items)){
    body=exercise.items.map((item,index)=>{
      const hasAnswer=typeof item.answer==='string'&&item.answer.length>0;
      const key=englishPlanAnswerKey(session.id,exercise.id,index);
      const revealed=englishPlanAnswerReveals.has(key);
      return `<div class="english-plan-exercise-item">
        <div class="english-plan-prompt">${escapeHTML(item.prompt||'')}</div>
        ${hasAnswer?`<textarea class="english-plan-answer-input" aria-label="${trText('Твой ответ','Your answer')}" oninput="saveEnglishPlanAnswer('${session.id}','${exercise.id}',${index},this.value)" placeholder="${trText('Твой ответ…','Your answer…')}">${escapeHTML(englishPlanLessonState(session.id).answers?.[key]||'')}</textarea>
          <button class="english-plan-reveal" onclick="toggleEnglishPlanAnswer('${session.id}','${exercise.id}',${index})">${revealed?trText('Скрыть ответ','Hide answer'):trText('Показать ответ','Show answer')}</button>
          ${revealed?`<div class="english-plan-answer"><span>${trText('Ответ','Answer')}</span>${escapeHTML(item.answer)}</div>`:''}`:''}
        ${item.target?`<div class="english-plan-target"><span>${trText('Цель','Target')}</span>${escapeHTML(item.target)}</div>`:''}
      </div>`;
    }).join('');
  }else if(exercise.prompt){
    body=`<div class="english-plan-exercise-item"><div class="english-plan-prompt">${escapeHTML(exercise.prompt)}</div></div>`;
  }
  return `<div class="english-plan-exercise">
    <div class="english-plan-exercise-head"><strong>${escapeHTML(exercise.id||'')}</strong><span>${escapeHTML(String(exercise.type||'').replaceAll('_',' '))}</span></div>
    <div class="english-plan-instruction">${instruction}</div>${body}
  </div>`;
}
function renderEnglishWeekPlanView(){
  const completed=englishPlanCompletedCount();
  const pct=Math.round(completed/ENGLISH_WEEK_PLAN.sessions.length*100);
  const title=(data.language||'ru')==='en'?ENGLISH_WEEK_PLAN.title.en:ENGLISH_WEEK_PLAN.title.ru;
  return `<div class="english-plan-view">
    <div class="english-plan-summary-card">
      <div class="english-detail-type">${escapeHTML(ENGLISH_WEEK_PLAN.level)} · ${ENGLISH_WEEK_PLAN.totalMinutes} ${trText('мин','min')}</div>
      <div class="english-plan-view-title">${escapeHTML(title)}</div>
      <div class="english-plan-methods">${ENGLISH_WEEK_PLAN.method.map(m=>`<span>${escapeHTML(englishPlanMethodLabel(m))}</span>`).join('')}</div>
      <div class="english-plan-summary-progress"><strong>${completed} / ${ENGLISH_WEEK_PLAN.sessions.length}</strong><span>${trText('уроков завершено','lessons completed')}</span></div>
      <div class="progress"><span style="width:${pct}%"></span></div>
    </div>
    <div class="english-plan-lessons">${ENGLISH_WEEK_PLAN.sessions.map((session,index)=>{
      const state=englishPlanLessonState(session.id);
      return `<button class="english-plan-lesson-card ${state.completedAt?'completed':''}" onclick="openEnglishPlanLesson('${session.id}')">
        <div class="english-plan-lesson-top"><span>${trText('Урок','Lesson')} ${index+1} · ${session.durationMinutes} ${trText('мин','min')}</span><em>${escapeHTML(englishPlanStatusLabel(state.status||'New'))}</em></div>
        <strong>${escapeHTML(session.topic)}</strong>
        <p>${escapeHTML(session.mainFocus)}</p>
        ${state.completedAt?`<div class="english-plan-done">✓ ${trText('Завершено','Completed')}</div>`:''}
      </button>`;
    }).join('')}</div>
    <div class="english-plan-success-card">
      <strong>${trText('Критерии успеха недели','Weekly success criteria')}</strong>
      <ol>${ENGLISH_WEEK_PLAN.weeklySuccessCriteria.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ol>
    </div>
  </div>`;
}
function renderEnglishPlanLessonView(){
  const session=englishPlanSession(englishPlanSessionId);
  if(!session)return `<div class="english-review-empty"><strong>${trText('Урок не найден','Lesson not found')}</strong></div>`;
  const state=englishPlanLessonState(session.id);
  const index=ENGLISH_WEEK_PLAN.sessions.findIndex(s=>s.id===session.id)+1;
  const refs=(ENGLISH_WEEK_PLAN_GRAMMAR_REFS[session.id]||[]).map(id=>englishItemById(id)).filter(Boolean);
  return `<div class="english-plan-lesson-view">
    <div class="english-plan-lesson-hero">
      <div class="english-detail-type">${trText('Урок','Lesson')} ${index} · ${session.durationMinutes} ${trText('мин','min')}</div>
      <div class="english-detail-title">${escapeHTML(session.topic)}</div>
      <div class="english-plan-focus-text">${escapeHTML(session.mainFocus)}</div>
      <div class="english-plan-statuses">${ENGLISH_WEEK_PLAN.appUiSuggestions.lessonStatusLabels.map(s=>`<button class="${state.status===s?'active':''}" onclick="setEnglishPlanLessonStatus('${session.id}','${s}')">${escapeHTML(englishPlanStatusLabel(s))}</button>`).join('')}</div>
    </div>

    <div class="english-plan-section">
      <div class="english-plan-section-head"><strong>${trText('План урока','Lesson flow')}</strong><span>${session.durationMinutes} ${trText('мин','min')}</span></div>
      <div class="english-plan-blocks">${session.blocks.map(b=>`<div class="english-plan-block"><b>${b.minutes}</b><div><strong>${escapeHTML(englishPlanBlockLabel(b.type))}</strong><span>${escapeHTML(b.instruction)}</span></div></div>`).join('')}</div>
    </div>

    ${refs.length?`<div class="english-plan-section"><div class="english-plan-section-head"><strong>${trText('Связано с существующими темами','Uses existing grammar topics')}</strong></div><div class="english-plan-ref-chips">${refs.map(r=>`<span>${escapeHTML(englishCompactTitle(r))}</span>`).join('')}</div></div>`:''}

    ${Array.isArray(session.rules)&&session.rules.length?`<div class="english-plan-section"><div class="english-plan-section-head"><strong>${trText('Правила и примеры','Rules & examples')}</strong></div><div class="english-plan-rules">${session.rules.map(r=>`<div class="english-plan-rule"><strong>${escapeHTML(r.rule)}</strong>${(r.examples||[]).map(e=>`<div class="english-plan-rule-example">${escapeHTML(e)}</div>`).join('')}</div>`).join('')}</div></div>`:''}

    <div class="english-plan-section"><div class="english-plan-section-head"><strong>${trText('Упражнения','Exercises')}</strong></div><div class="english-plan-exercises">${(session.exercises||[]).map(e=>renderEnglishPlanExercise(session,e)).join('')}</div></div>

    <div class="english-plan-section"><div class="english-plan-section-head"><strong>${trText('Новые слова и выражения','Words & phrases')}</strong><span>${trText('Перевод скрыт','Translation hidden')}</span></div><div class="english-plan-vocab">${(session.vocabulary||[]).map((v,i)=>{
      const key=englishPlanTranslationKey(session.id,i),revealed=englishPlanTranslationReveals.has(key);
      return `<div class="english-plan-vocab-card">
        <div class="english-plan-vocab-top"><strong>${escapeHTML(v.term)}</strong>${v.nzUsage?`<span>NZ</span>`:''}</div>
        <div class="english-item-ipa">${escapeHTML(v.ipa||'')}</div>
        <div class="english-plan-vocab-example">${escapeHTML(v.example||'')}</div>
        <button class="english-plan-reveal" onclick="toggleEnglishPlanTranslation('${session.id}',${i})">${revealed?trText('Скрыть перевод','Hide translation'):trText('Показать перевод','Reveal translation')}</button>
        ${revealed?`<div class="english-plan-translation">${escapeHTML(v.translationRu||'')}</div>`:''}
      </div>`;
    }).join('')}</div></div>

    <button class="english-plan-finish ${state.completedAt?'completed':''}" onclick="finishEnglishPlanLesson('${session.id}')" ${state.completedAt?'disabled':''}>${state.completedAt?`✓ ${trText('Урок завершён','Lesson completed')}`:trText('Завершить урок','Finish lesson')}</button>
  </div>`;
}

function englishAllItems(){
  return [...ENGLISH_WORD_SEEDS,...ENGLISH_GRAMMAR_SEEDS,...ENGLISH_MISTAKE_SEEDS,...englishLearningStore().customItems];
}
function englishItemById(id){return englishAllItems().find(x=>x.id===id)||null}
function englishCompactTitle(item){
  return item?.shortTitle||item?.title||'';
}
function englishItemsByKind(kind){
  const all=englishAllItems();
  if(kind==='words')return all.filter(x=>['word','phrase','phrasal'].includes(x.kind));
  if(kind==='grammar')return all.filter(x=>x.kind==='grammar');
  if(kind==='mistakes')return all.filter(x=>x.kind==='mistake');
  return all;
}
const ENGLISH_DAILY_NEW_LIMIT=3;
const ENGLISH_DAILY_MAX=10;

function englishReviewState(id){return englishLearningStore().review[id]||null}

function englishItemCategory(item){
  if(['word','phrase','phrasal'].includes(item?.kind))return 'words';
  if(item?.kind==='grammar')return 'grammar';
  if(item?.kind==='mistake')return 'mistakes';
  return 'other';
}

function englishIsScheduledDue(item,dateKey=localDate()){
  const state=englishReviewState(item.id);
  return !!(state?.nextReview && state.nextReview<=dateKey);
}

function englishQueueItemActive(item,dateKey=localDate()){
  const state=englishReviewState(item.id);
  if(!state?.lastReviewed)return true;
  return !!(state.nextReview && state.nextReview<=dateKey);
}

function englishDailyNewPattern(dateKey){
  const patterns=[
    ['words','grammar','words'],
    ['words','mistakes','grammar'],
    ['grammar','words','mistakes'],
    ['words','grammar','mistakes']
  ];
  const seed=Number(String(dateKey).replace(/-/g,''))||0;
  return patterns[seed%patterns.length];
}

function englishPickNewItems(excludedIds,dateKey,limit){
  if(limit<=0)return [];
  const candidates=englishAllItems()
    .filter(item=>{
      if(excludedIds.has(item.id))return false;
      return !englishReviewState(item.id)?.lastReviewed;
    })
    .sort((a,b)=>(a.initialDue?0:1)-(b.initialDue?0:1));

  const groups={words:[],grammar:[],mistakes:[],other:[]};
  candidates.forEach(item=>(groups[englishItemCategory(item)]||groups.other).push(item));

  const picked=[];
  const pickedIds=new Set();
  for(const category of englishDailyNewPattern(dateKey)){
    if(picked.length>=limit)break;
    const next=(groups[category]||[]).find(item=>!pickedIds.has(item.id));
    if(next){picked.push(next);pickedIds.add(next.id)}
  }
  for(const item of candidates){
    if(picked.length>=limit)break;
    if(pickedIds.has(item.id))continue;
    picked.push(item);
    pickedIds.add(item.id);
  }
  return picked;
}

function persistEnglishDailyQueueQuietly(){
  data.schemaVersion=CURRENT_SCHEMA_VERSION;
  writeLocalCopies(data);
  writeVaultCopies(structuredClone(data),false).catch(err=>{
    console.warn('Daily English queue vault write failed',err);
  });
}

function ensureEnglishDailyQueue(dateKey=localDate(),{persist=false}={}){
  const store=englishLearningStore();
  const existing=store.dailyQueue||{date:'',itemIds:[],newItemIds:[]};

  if(existing.date===dateKey && Array.isArray(existing.itemIds)){
    if(persist)persistEnglishDailyQueueQuietly();
    return existing;
  }

  const itemMap=new Map(englishAllItems().map(item=>[item.id,item]));
  const selected=[];
  const selectedIds=new Set();
  const addId=id=>{
    if(selected.length>=ENGLISH_DAILY_MAX || selectedIds.has(id) || !itemMap.has(id))return;
    selected.push(id);
    selectedIds.add(id);
  };

  // Carry unfinished cards from the last queue.
  for(const id of (existing.itemIds||[])){
    const item=itemMap.get(id);
    if(item && englishQueueItemActive(item,dateKey))addId(id);
  }

  // Add scheduled/overdue reviews, oldest first.
  englishAllItems()
    .filter(item=>englishIsScheduledDue(item,dateKey))
    .sort((a,b)=>{
      const ad=englishReviewState(a.id)?.nextReview||'9999-12-31';
      const bd=englishReviewState(b.id)?.nextReview||'9999-12-31';
      return ad.localeCompare(bd);
    })
    .forEach(item=>addId(item.id));

  // Add up to three unseen cards if the daily workload has room.
  const newSlots=Math.max(0,Math.min(
    ENGLISH_DAILY_NEW_LIMIT,
    ENGLISH_DAILY_MAX-selected.length
  ));
  const newItems=englishPickNewItems(selectedIds,dateKey,newSlots);
  newItems.forEach(item=>addId(item.id));

  store.dailyQueue={date:dateKey,itemIds:selected,newItemIds:newItems.map(item=>item.id)};
  if(persist)persistEnglishDailyQueueQuietly();
  return store.dailyQueue;
}

function englishTodayQueueItems(dateKey=localDate()){
  const queue=ensureEnglishDailyQueue(dateKey,{persist:false});
  return (queue.itemIds||[])
    .map(id=>englishItemById(id))
    .filter(Boolean)
    .filter(item=>englishQueueItemActive(item,dateKey));
}

function englishIsDue(item,dateKey=localDate()){
  if(englishIsScheduledDue(item,dateKey))return true;
  const queue=englishLearningStore().dailyQueue;
  return !!(
    queue?.date===dateKey &&
    Array.isArray(queue.itemIds) &&
    queue.itemIds.includes(item.id) &&
    englishQueueItemActive(item,dateKey)
  );
}

function englishDueItems(dateKey=localDate()){
  return englishTodayQueueItems(dateKey);
}

function englishReviewCounts(){
  const due=englishTodayQueueItems(localDate());
  const queue=englishLearningStore().dailyQueue;
  const activeIds=new Set(due.map(x=>x.id));
  const newCount=(queue?.date===localDate() && Array.isArray(queue.newItemIds))
    ?queue.newItemIds.filter(id=>activeIds.has(id)).length
    :0;
  return {
    words:due.filter(x=>['word','phrase','phrasal'].includes(x.kind)).length,
    grammar:due.filter(x=>x.kind==='grammar').length,
    mistakes:due.filter(x=>x.kind==='mistake').length,
    newCount,
    total:due.length
  };
}
function englishReviewedCount(){
  const ids=new Set(englishAllItems().map(x=>x.id));
  return Object.entries(englishLearningStore().review)
    .filter(([id,state])=>ids.has(id)&&state&&state.lastReviewed).length;
}
function englishKindLabel(kind){
  const labels={
    word:[trText('Слово','Word'),trText('Слова','Words')],
    phrase:[trText('Фраза','Phrase'),trText('Фразы','Phrases')],
    phrasal:[trText('Фразовый глагол','Phrasal verb'),trText('Фразовые глаголы','Phrasal verbs')],
    grammar:[trText('Грамматика','Grammar'),trText('Грамматика','Grammar')],
    mistake:[trText('Моя ошибка','My mistake'),trText('Мои ошибки','My mistakes')]
  };
  return labels[kind]?.[0]||kind;
}
function englishReviewBadge(item){
  const state=englishReviewState(item.id);
  if(englishIsDue(item))return `<span class="english-due-badge">${trText('Повторить сегодня','Due today')}</span>`;
  if(state?.nextReview)return `<span class="english-review-badge">${trText('Повторить','Review')} ${bodyFriendlyDate(state.nextReview,true)}</span>`;
  return `<span class="english-review-badge">${trText('Не повторялось','Not reviewed')}</span>`;
}
function englishItemPrimaryText(item){
  if(item.kind==='mistake')return item.correct||item.ru||'';
  if(item.kind==='grammar')return (data.language||'ru')==='en'?(item.ruleEn||item.note||''):(item.ruleRu||item.ru||item.note||'');
  return item.ru||'';
}
function englishItemRuleText(item){
  if(item.kind==='mistake')return (data.language||'ru')==='en'?(item.ruleEn||item.note||''):(item.ruleRu||item.note||'');
  if(item.kind==='grammar')return (data.language||'ru')==='en'?(item.ruleEn||item.note||''):(item.ruleRu||item.ru||item.note||'');
  return item.note||'';
}
function englishItemExample(item){
  if(Array.isArray(item.examples))return item.examples.join(' · ');
  return item.example||'';
}
function englishItemIsCustom(item){return String(item?.id||'').startsWith('custom_')}

function englishMinutesForDate(dateKey){
  const row=data.logs?.[dateKey]||{};
  const detailed=englishTypes.reduce((s,[id])=>s+(Number(row[id])||0),0);
  return detailed || (Number(row.english_general)||0);
}
function englishWeekData(){
  const keys=weeklyKeys(weeklyMonday(),7);
  return keys.map(date=>({date,value:date<=localDate()?englishMinutesForDate(date):0}));
}
function englishWeekdayShort(dateKey){
  const locale=(data.language||'ru')==='en'?'en-NZ':'ru-RU';
  return new Date(dateKey+'T12:00:00').toLocaleDateString(locale,{weekday:'short'}).slice(0,3);
}

function openEnglishLearning(view='words',itemId=''){
  englishLearningView=view;
  englishLearningItemId=itemId||'';
  if(view==='review'){
    ensureEnglishDailyQueue(localDate(),{persist:true});
    englishReviewQueueIds=englishDueItems(localDate()).map(x=>x.id);
    englishReviewInitialTotal=englishReviewQueueIds.length;
    englishReviewAnswerShown=false;
  }
  document.getElementById('englishLearningModal')?.classList.add('show');
  document.body.style.overflow='hidden';
  renderEnglishLearning();
}
function closeEnglishLearning(){
  document.getElementById('englishLearningModal')?.classList.remove('show');
  document.body.style.overflow='';
  englishLearningItemId='';
}
function englishLearningBack(){
  if(englishLearningView==='lesson'){
    englishLearningView='plan';
    englishPlanSessionId='';
    renderEnglishLearning();
    return;
  }
  if(englishLearningView==='plan'){
    closeEnglishLearning();
    return;
  }
  if(englishLearningView==='practice'){
    englishLearningView='detail';
    englishLearningItemId=englishPracticeItemId;
    renderEnglishLearning();
    return;
  }
  if(englishLearningView==='detail'){
    englishLearningView=englishLearningParent||'words';
    englishLearningItemId='';
    renderEnglishLearning();
    return;
  }
  closeEnglishLearning();
}
function openEnglishItem(id,parent='words'){
  if(!englishItemById(id))return;
  englishLearningParent=parent;
  englishLearningView='detail';
  englishLearningItemId=id;
  renderEnglishLearning();
}
function setEnglishWordFilter(filter){
  englishWordFilter=filter||'all';
  renderEnglishLearning();
}
function renderEnglishWordList(searchValue){
  if(searchValue!==undefined)englishWordSearch=String(searchValue||'');
  const host=document.getElementById('englishWordList');
  if(!host)return;

  const q=englishWordSearch.trim().toLowerCase();
  let items=englishItemsByKind('words');

  if(englishWordFilter!=='all')items=items.filter(x=>x.kind===englishWordFilter);
  if(q)items=items.filter(x=>
    String(x.title||'').toLowerCase().includes(q)||
    String(x.ru||'').toLowerCase().includes(q)||
    String(x.example||'').toLowerCase().includes(q)
  );

  items.sort((a,b)=>{
    const ad=englishIsDue(a)?0:1,bd=englishIsDue(b)?0:1;
    if(ad!==bd)return ad-bd;
    return String(a.title).localeCompare(String(b.title));
  });

  host.innerHTML=items.length?items.map(item=>`
    <button class="english-item-card ${englishIsDue(item)?'due':''}" onclick="openEnglishItem('${item.id}','words')">
      <div class="english-item-status">${englishReviewBadge(item)}</div>
      <div><span class="english-item-title">${escapeHTML(item.title)}</span>${item.ipa?`<span class="english-item-ipa">${escapeHTML(item.ipa)}</span>`:''}</div>
      <div class="english-item-ru">${item.translationHidden?trText('Перевод скрыт — открой карточку','Translation hidden — open the card'):escapeHTML(item.ru||'')}</div>
      ${item.example?`<div class="english-item-example">${escapeHTML(item.example)}</div>`:''}
      <div class="english-item-chips"><span class="english-item-chip">${englishKindLabel(item.kind)}</span>${item.level?`<span class="english-item-chip">${escapeHTML(item.level)}</span>`:''}</div>
    </button>
  `).join(''):`<div class="english-review-empty"><strong>${trText('Ничего не найдено','Nothing found')}</strong></div>`;
}
function escapeHTML(value){
  return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function renderEnglishWordsView(){
  const filters=[
    ['all',trText('Все','All')],
    ['word',trText('Слова','Words')],
    ['phrase',trText('Фразы','Phrases')],
    ['phrasal',trText('Фразовые глаголы','Phrasal verbs')]
  ];
  return `
    <div class="english-library-tools">
      <div class="english-filter-tabs">${filters.map(([id,label])=>`<button class="${englishWordFilter===id?'active':''}" onclick="setEnglishWordFilter('${id}')">${label}</button>`).join('')}</div>
      <div class="english-search"><input id="englishWordSearchInput" value="${escapeHTML(englishWordSearch)}" oninput="renderEnglishWordList(this.value)" placeholder="${trText('Поиск слов и фраз…','Search words and phrases…')}"></div>
    </div>
    <div id="englishWordList" class="english-library-list"></div>`;
}
function renderEnglishGrammarView(){
  const items=englishItemsByKind('grammar').slice().sort((a,b)=>{
    const ad=englishIsDue(a)?0:1,bd=englishIsDue(b)?0:1;
    if(ad!==bd)return ad-bd;
    return String(a.title).localeCompare(String(b.title));
  });
  return `<div class="english-grammar-list">${items.map(item=>`
    <button class="english-curriculum-card ${englishIsDue(item)?'due':''}" onclick="openEnglishItem('${item.id}','grammar')">
      <div class="english-curriculum-top">
        <span class="english-curriculum-title">${escapeHTML(item.title)}</span>
        <span class="english-curriculum-meta">${escapeHTML(item.level||'')} · ${englishReviewBadge(item)}</span>
      </div>
      <div class="english-curriculum-rule">${escapeHTML(englishItemRuleText(item))}</div>
    </button>
  `).join('')}</div>`;
}
function renderEnglishMistakesView(){
  const items=englishItemsByKind('mistakes').slice().sort((a,b)=>{
    const ad=englishIsDue(a)?0:1,bd=englishIsDue(b)?0:1;
    return ad-bd;
  });
  return `<div class="english-mistake-list">${items.map(item=>`
    <button class="english-item-card ${englishIsDue(item)?'due':''}" onclick="openEnglishItem('${item.id}','mistakes')">
      <div class="english-item-status">${englishReviewBadge(item)}<span class="english-item-chip">${escapeHTML(item.level||'')}</span></div>
      <div class="english-mistake-wrong">✕ ${escapeHTML(item.title)}</div>
      <div class="english-mistake-correct">✓ ${escapeHTML(item.correct||item.ru||'')}</div>
      <div class="english-item-rule-preview">${escapeHTML(englishItemRuleText(item))}</div>
    </button>
  `).join('')}</div>`;
}
function renderEnglishDetailView(item){
  if(!item)return `<div class="english-review-empty"><strong>${trText('Элемент не найден','Item not found')}</strong></div>`;
  const isMistake=item.kind==='mistake';
  const meaning=englishItemPrimaryText(item);
  const rule=englishItemRuleText(item);
  const example=englishItemExample(item);
  const state=englishReviewState(item.id);
  const canPractice=item.kind==='grammar'&&englishHasPractice(item.id);

  return `<div class="english-detail-card">
    <div class="english-detail-type">${englishKindLabel(item.kind)} ${item.level?`· ${escapeHTML(item.level)}`:''}</div>
    <div class="english-detail-title">${escapeHTML(item.title)}</div>
    ${item.ipa?`<div class="english-detail-ipa">${escapeHTML(item.ipa)}</div>`:''}
    ${meaning?(item.translationHidden&&!isMistake&&!englishWordTranslationReveals.has(item.id)
      ?`<button class="english-plan-reveal english-word-reveal" onclick="toggleEnglishWordTranslation('${item.id}')">${trText('Показать перевод','Reveal translation')}</button>`
      :`<div class="english-detail-translation">${isMistake?'✓ ':''}${escapeHTML(meaning)}</div>${item.translationHidden&&!isMistake?`<button class="english-plan-reveal english-word-reveal" onclick="toggleEnglishWordTranslation('${item.id}')">${trText('Скрыть перевод','Hide translation')}</button>`:''}`):''}
    ${item.formula?`<div class="english-detail-section"><div class="label">${trText('Формула','Formula')}</div><div class="english-detail-example english-detail-formula">${escapeHTML(item.formula)}</div></div>`:''}
    ${rule?`<div class="english-detail-section"><div class="label">${trText('Правило','Rule')}</div><div class="english-detail-example">${escapeHTML(rule)}</div></div>`:''}
    ${example?`<div class="english-detail-section"><div class="label">${trText('Пример','Example')}</div><div class="english-detail-example">${escapeHTML(example)}</div></div>`:''}
    <div class="english-detail-section"><div class="label">${trText('Повторение','Review')}</div><div class="small">${state?.nextReview?`${trText('Следующее','Next')}: ${bodyFriendlyDate(state.nextReview)}`:trText('Ещё не повторялось','Not reviewed yet')}</div></div>
    <div class="english-detail-actions ${canPractice?'':'single'}">
      ${canPractice
        ?`<button class="secondary" onclick="openEnglishPractice('${item.id}')">${trText('Нужна практика','Need practice')}</button>`
        :`<button class="secondary" onclick="quickEnglishReview('${item.id}','hard')">${trText('Повторить позже','Review later')}</button>`}
      <button onclick="quickEnglishReview('${item.id}','know')">${trText('Понятно','Got it')}</button>
    </div>
    ${englishItemIsCustom(item)?`<button class="danger" style="width:100%;margin-top:8px" onclick="deleteEnglishCustomItem('${item.id}')">${trText('Удалить','Delete')}</button>`:''}
  </div>`;
}

function englishReviewIntervals(){return [3,7,14,30,60,120]}
function englishRateItem(id,result){
  const item=englishItemById(id);
  if(!item)return;
  const store=englishLearningStore();
  const prev=store.review[id]||{};
  let stage=Number(prev.stage||0),days=0;

  if(result==='again'){
    stage=0;days=0;
  }else if(result==='hard'){
    days=2;
  }else{
    stage=Math.min(englishReviewIntervals().length,stage+1);
    days=englishReviewIntervals()[Math.max(0,stage-1)]||120;
  }

  store.review[id]={
    stage,
    lastResult:result,
    lastReviewed:localDate(),
    nextReview:weeklyAddDays(localDate(),days),
    reviewCount:Number(prev.reviewCount||0)+1
  };
  persistData({renderAfter:true,makeSnapshot:true});
}
function quickEnglishReview(id,result){
  englishRateItem(id,result);
  renderEnglishLearning();
}
function revealEnglishReviewAnswer(){
  englishReviewAnswerShown=true;
  renderEnglishLearning();
}
function rateEnglishReview(result){
  if(!englishReviewQueueIds.length)return;
  const id=englishReviewQueueIds.shift();
  englishRateItem(id,result);
  if(result==='again')englishReviewQueueIds.push(id);
  englishReviewAnswerShown=false;
  renderEnglishLearning();
}
function englishReviewFront(item){
  if(item.kind==='mistake'){
    return {
      main:item.title,
      prompt:trText('Исправь предложение в голове, затем открой ответ.','Correct the sentence in your head, then reveal the answer.')
    };
  }
  if(item.kind==='grammar'){
    return {
      main:item.title,
      prompt:trText('Вспомни правило, формулу и один пример.','Recall the rule, formula, and one example.')
    };
  }
  return {
    main:item.title,
    prompt:trText('Вспомни значение и попробуй составить пример.','Recall the meaning and try to make an example.')
  };
}
function englishReviewAnswerHTML(item){
  if(item.kind==='mistake'){
    const rule=englishItemRuleText(item);
    return `
      <div class="english-review-revealed">
        <div class="english-review-answer"><span class="review-answer-label">${trText('Правильно','Correct')}</span>${escapeHTML(item.correct||'')}</div>
        ${rule?`<div class="english-review-example">${escapeHTML(rule)}</div>`:''}
      </div>`;
  }
  if(item.kind==='grammar'){
    const rule=englishItemRuleText(item);
    const example=englishItemExample(item);
    return `
      <div class="english-review-revealed">
        ${item.formula?`<div class="english-review-answer"><span class="review-answer-label">${trText('Формула','Formula')}</span>${escapeHTML(item.formula)}</div>`:''}
        ${rule?`<div class="english-review-example">${escapeHTML(rule)}</div>`:''}
        ${example?`<div class="english-review-example">${escapeHTML(example)}</div>`:''}
      </div>`;
  }
  const meaning=englishItemPrimaryText(item);
  const example=englishItemExample(item);
  return `
    <div class="english-review-revealed">
      ${meaning?`<div class="english-review-answer"><span class="review-answer-label">${trText('Значение','Meaning')}</span>${escapeHTML(meaning)}</div>`:''}
      ${example?`<div class="english-review-example">${escapeHTML(example)}</div>`:''}
    </div>`;
}
function renderEnglishReviewView(){
  if(!englishReviewQueueIds.length){
    return `<div class="english-review-empty"><strong>✓ ${trText('На сегодня всё','You are caught up')}</strong><div class="small">${trText('Следующие карточки появятся по расписанию повторения.','The next cards will appear according to the review schedule.')}</div></div>`;
  }
  const item=englishItemById(englishReviewQueueIds[0]);
  if(!item){
    englishReviewQueueIds.shift();
    englishReviewAnswerShown=false;
    return renderEnglishReviewView();
  }

  const done=Math.max(0,englishReviewInitialTotal-englishReviewQueueIds.length);
  const front=englishReviewFront(item);

  return `<div class="english-review-session">
    <div class="english-review-progress"><span>${trText('Повторение','Review')}</span><span>${Math.min(done+1,Math.max(1,englishReviewInitialTotal))} / ${Math.max(1,englishReviewInitialTotal)}</span></div>
    <div class="english-review-card">
      <div class="english-review-kind">${englishKindLabel(item.kind)} ${item.level?`· ${escapeHTML(item.level)}`:''}</div>
      <div class="english-review-main">${escapeHTML(front.main)}</div>
      ${item.ipa?`<div class="english-detail-ipa">${escapeHTML(item.ipa)}</div>`:''}
      <div class="english-review-think">${escapeHTML(front.prompt)}</div>
      ${englishReviewAnswerShown?englishReviewAnswerHTML(item):`
        <button class="english-reveal-answer" onclick="revealEnglishReviewAnswer()">${trText('Показать ответ','Show answer')}</button>
      `}
    </div>
    ${englishReviewAnswerShown?`
      <div class="english-review-rating-hint">${trText('Насколько легко ты вспомнил ответ?','How easily did you recall it?')}</div>
      <div class="english-review-buttons">
        <button class="again" onclick="rateEnglishReview('again')"><strong>${trText('Снова','Again')}</strong><span>${trText('Сегодня','Today')}</span></button>
        <button class="hard" onclick="rateEnglishReview('hard')"><strong>${trText('Сложно','Hard')}</strong><span>2 ${trText('дня','days')}</span></button>
        <button class="know" onclick="rateEnglishReview('know')"><strong>${trText('Знаю','Know')}</strong><span>3+ ${trText('дня','days')}</span></button>
      </div>
    `:''}
  </div>`;
}

function openEnglishPractice(id){
  if(!englishHasPractice(id))return;
  englishPracticeItemId=id;
  englishPracticeIndex=0;
  englishPracticeScore=0;
  englishPracticeAnswered=false;
  englishPracticeSelected=-1;
  englishLearningView='practice';
  englishLearningItemId=id;
  renderEnglishLearning();
}
function answerEnglishPractice(optionIndex){
  if(englishPracticeAnswered)return;
  const questions=englishPracticeQuestions(englishPracticeItemId);
  const q=questions[englishPracticeIndex];
  if(!q)return;
  englishPracticeSelected=Number(optionIndex);
  englishPracticeAnswered=true;
  if(englishPracticeSelected===q.answer)englishPracticeScore++;
  renderEnglishLearning();
}
function nextEnglishPractice(){
  const questions=englishPracticeQuestions(englishPracticeItemId);
  if(!questions.length)return;
  if(englishPracticeIndex<questions.length-1){
    englishPracticeIndex++;
    englishPracticeAnswered=false;
    englishPracticeSelected=-1;
  }else{
    englishPracticeIndex=questions.length;
  }
  renderEnglishLearning();
}
function restartEnglishPractice(){
  englishPracticeIndex=0;
  englishPracticeScore=0;
  englishPracticeAnswered=false;
  englishPracticeSelected=-1;
  renderEnglishLearning();
}
function finishEnglishPractice(){
  englishLearningView='detail';
  englishLearningItemId=englishPracticeItemId;
  renderEnglishLearning();
}
function renderEnglishPracticeView(){
  const item=englishItemById(englishPracticeItemId);
  const questions=englishPracticeQuestions(englishPracticeItemId);
  if(!item||!questions.length){
    return `<div class="english-review-empty"><strong>${trText('Практика пока недоступна','Practice is not available yet')}</strong></div>`;
  }

  if(englishPracticeIndex>=questions.length){
    const pct=Math.round(englishPracticeScore/questions.length*100);
    const message=englishPracticeScore>=4
      ?trText('Хороший результат. Теперь попробуй составить свой пример вслух.','Good quiz result. Now try making your own example aloud.')
      :trText('Эту тему стоит ещё немного потренировать.','This topic needs a little more practice.');
    return `<div class="english-practice-finish">
      <div class="english-practice-score">${englishPracticeScore} / ${questions.length}</div>
      <div class="english-practice-percent">${pct}%</div>
      <strong>${escapeHTML(message)}</strong>
      <div class="english-practice-finish-actions">
        <button class="secondary" onclick="restartEnglishPractice()">${trText('Пройти ещё раз','Practice again')}</button>
        <button onclick="finishEnglishPractice()">${trText('Назад к правилу','Back to rule')}</button>
      </div>
    </div>`;
  }

  const q=questions[englishPracticeIndex];
  const explanation=(data.language||'ru')==='en'?q.en:q.ru;

  return `<div class="english-practice-session">
    <div class="english-practice-progress">
      <span>${escapeHTML(englishCompactTitle(item))}</span>
      <span>${englishPracticeIndex+1} / ${questions.length}</span>
    </div>
    <div class="english-practice-card">
      <div class="english-practice-label">${trText('Выбери правильный вариант','Choose the correct option')}</div>
      <div class="english-practice-question">${escapeHTML(q.q)}</div>
      <div class="english-practice-options">
        ${q.options.map((option,index)=>{
          let cls='';
          if(englishPracticeAnswered){
            if(index===q.answer)cls='correct';
            else if(index===englishPracticeSelected)cls='wrong';
            else cls='muted';
          }
          return `<button class="${cls}" onclick="answerEnglishPractice(${index})" ${englishPracticeAnswered?'disabled':''}>${escapeHTML(option)}</button>`;
        }).join('')}
      </div>
      ${englishPracticeAnswered?`
        <div class="english-practice-feedback ${englishPracticeSelected===q.answer?'correct':'wrong'}">
          <strong>${englishPracticeSelected===q.answer?trText('Верно','Correct'):trText('Не совсем','Not quite')}</strong>
          <span>${escapeHTML(explanation)}</span>
        </div>
        <button class="english-practice-next" onclick="nextEnglishPractice()">${englishPracticeIndex===questions.length-1?trText('Результат','See result'):trText('Следующий вопрос','Next question')} →</button>
      `:''}
    </div>
  </div>`;
}

function renderEnglishLearning(){
  const modal=document.getElementById('englishLearningModal');
  const host=document.getElementById('englishLearningContent');
  if(!modal||!host)return;

  const title=document.getElementById('englishLearningTitle');
  const subtitle=document.getElementById('englishLearningSubtitle');
  const add=document.getElementById('englishLearningAddBtn');

  let content='';
  if(englishLearningView==='words'){
    if(title)title.textContent='Words & Phrases';
    if(subtitle)subtitle.textContent=`${englishItemsByKind('words').length} ${trText('элементов','items')}`;
    if(add)add.style.visibility='visible';
    content=renderEnglishWordsView();
  }else if(englishLearningView==='grammar'){
    if(title)title.textContent='Grammar Rules';
    if(subtitle)subtitle.textContent=`${englishItemsByKind('grammar').length} ${trText('тем','topics')}`;
    if(add)add.style.visibility='visible';
    content=renderEnglishGrammarView();
  }else if(englishLearningView==='mistakes'){
    if(title)title.textContent='My Mistakes';
    if(subtitle)subtitle.textContent=trText('Твои реальные ошибки','Your real mistakes');
    if(add)add.style.visibility='visible';
    content=renderEnglishMistakesView();
  }else if(englishLearningView==='review'){
    if(title)title.textContent='Review Queue';
    if(subtitle)subtitle.textContent=`${englishReviewQueueIds.length} ${trText('осталось','remaining')}`;
    if(add)add.style.visibility='hidden';
    content=renderEnglishReviewView();
  }else if(englishLearningView==='practice'){
    const item=englishItemById(englishPracticeItemId);
    if(title)title.textContent=trText('Практика','Practice');
    if(subtitle)subtitle.textContent=item?englishCompactTitle(item):'';
    if(add)add.style.visibility='hidden';
    content=renderEnglishPracticeView();
  }else if(englishLearningView==='plan'){
    if(title)title.textContent=trText('План B2 · Неделя 1','B2 Plan · Week 1');
    if(subtitle)subtitle.textContent=`${ENGLISH_WEEK_PLAN.sessions.length} ${trText('урока','lessons')} · ${ENGLISH_WEEK_PLAN.totalMinutes} ${trText('мин','min')}`;
    if(add)add.style.visibility='hidden';
    content=renderEnglishWeekPlanView();
  }else if(englishLearningView==='lesson'){
    const session=englishPlanSession(englishPlanSessionId);
    if(title)title.textContent=session?.topic||trText('Урок','Lesson');
    if(subtitle)subtitle.textContent=session?`${session.durationMinutes} ${trText('мин','min')}`:'';
    if(add)add.style.visibility='hidden';
    content=renderEnglishPlanLessonView();
  }else{
    const item=englishItemById(englishLearningItemId);
    if(title)title.textContent=item?.title||'English';
    if(subtitle)subtitle.textContent=item?englishKindLabel(item.kind):'';
    if(add)add.style.visibility='hidden';
    content=renderEnglishDetailView(item);
  }

  host.innerHTML=content;
  if(englishLearningView==='words')renderEnglishWordList();
}

function openEnglishAdd(){
  const modal=document.getElementById('englishAddModal');
  if(!modal)return;
  const kind=document.getElementById('englishAddKind');
  if(kind){
    kind.value=englishLearningView==='grammar'?'grammar':(englishLearningView==='mistakes'?'mistake':'word');
  }
  ['englishAddTerm','englishAddIpa','englishAddMeaning','englishAddExample','englishAddNote'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.value='';
  });
  modal.classList.add('show');
  renderEnglishAddLabels();
}
function closeEnglishAdd(){document.getElementById('englishAddModal')?.classList.remove('show')}
function renderEnglishAddLabels(){
  const kind=document.getElementById('englishAddKind')?.value||'word';
  const term=document.getElementById('englishAddTermLabel');
  const meaning=document.getElementById('englishAddMeaningLabel');
  const example=document.getElementById('englishAddExampleLabel');
  const note=document.getElementById('englishAddNoteLabel');
  const ipaField=document.getElementById('englishAddIpaField');

  if(kind==='mistake'){
    if(term)term.textContent=trText('Неправильное предложение','Wrong sentence');
    if(meaning)meaning.textContent=trText('Правильное предложение','Correct sentence');
    if(example)example.textContent=trText('Дополнительный пример','Extra example');
    if(note)note.textContent=trText('Правило / объяснение','Rule / explanation');
    if(ipaField)ipaField.style.display='none';
  }else if(kind==='grammar'){
    if(term)term.textContent=trText('Название правила','Rule title');
    if(meaning)meaning.textContent=trText('Объяснение','Explanation');
    if(example)example.textContent=trText('Пример','Example');
    if(note)note.textContent=trText('Формула / заметка','Formula / note');
    if(ipaField)ipaField.style.display='none';
  }else{
    if(term)term.textContent=trText('English','English');
    if(meaning)meaning.textContent=trText('Перевод на русский','Russian translation');
    if(example)example.textContent=trText('Пример','Example');
    if(note)note.textContent=trText('Заметка','Note');
    if(ipaField)ipaField.style.display='';
  }
}
function saveEnglishCustomItem(){
  const kind=document.getElementById('englishAddKind')?.value||'word';
  const title=document.getElementById('englishAddTerm')?.value.trim()||'';
  const ipa=document.getElementById('englishAddIpa')?.value.trim()||'';
  const meaning=document.getElementById('englishAddMeaning')?.value.trim()||'';
  const example=document.getElementById('englishAddExample')?.value.trim()||'';
  const note=document.getElementById('englishAddNote')?.value.trim()||'';

  if(!title){alert(trText('Добавь название или английский текст.','Add a title or English text.'));return}

  const item={
    id:`custom_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    kind,title,ipa,example,note,level:'Custom',initialDue:true,createdAt:new Date().toISOString()
  };

  if(kind==='mistake')item.correct=meaning;
  else if(kind==='grammar'){item.ruleRu=meaning;item.ruleEn=meaning;item.formula=note}
  else item.ru=meaning;

  englishLearningStore().customItems.push(item);
  closeEnglishAdd();
  persistData({renderAfter:true,makeSnapshot:true});

  englishLearningView=kind==='grammar'?'grammar':(kind==='mistake'?'mistakes':'words');
  renderEnglishLearning();
}
function deleteEnglishCustomItem(id){
  const item=englishItemById(id);
  if(!item||!englishItemIsCustom(item))return;
  if(!confirm(trText('Удалить этот учебный элемент?','Delete this learning item?')))return;
  const store=englishLearningStore();
  store.customItems=store.customItems.filter(x=>x.id!==id);
  delete store.review[id];
  delete store.favorites[id];
  persistData({renderAfter:true,makeSnapshot:true});
  englishLearningView=englishLearningParent||'words';
  englishLearningItemId='';
  renderEnglishLearning();
}


function dates(n){let arr=[];for(let i=n-1;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);arr.push(localDate(d))}return arr}
function val(id,d=localDate()){return data.logs[d]?.[id]}
function sum(id,n=7){return dates(n).reduce((s,d)=>s+(Number(data.logs[d]?.[id])||0),0)}
function avg(id,n=7){let xs=dates(n).map(d=>Number(data.logs[d]?.[id])).filter(v=>v>0);return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0}

function latestEntry(id){
  const keys=Object.keys(data.logs||{}).sort().reverse();
  for(const d of keys){
    const v=data.logs[d]?.[id];
    if(v!==undefined && v!==null && v!=='') return {date:d,value:v};
  }
  return null;
}
function dateLabel(d){
  if(!d)return '';
  const today=localDate();
  const yd=new Date(); yd.setDate(yd.getDate()-1);
  const yesterday=localDate(yd);
  if(d===today)return trText('Сегодня','Today');
  if(d===yesterday)return trText('Вчера','Yesterday');
  const dt=new Date(d+'T00:00:00');
  return (data.language||'ru')==='en'
    ? dt.toLocaleDateString('en-NZ',{day:'numeric',month:'short'})
    : dt.toLocaleDateString('ru-RU',{day:'numeric',month:'short'});
}
function boolCount(id,n=7){return dates(n).filter(d=>data.logs[d]?.[id]===true).length}
function pct(v,g){return !g?0:Math.min(100,Math.max(0,Math.round(v/g*100)))}
function save(){persistData({renderAfter:true,makeSnapshot:true})}
function ensureDay(d=localDate()){data.logs[d]=data.logs[d]||{};return data.logs[d]}

function tracker(id){return data.trackers.find(t=>t.id===id)||defaultTrackers.find(t=>t.id===id)}
function goalFor(id){return ({protein:data.proteinGoal,steps:data.stepsGoal,outdoors:data.outdoorsGoal,sleep:data.sleepGoal,gym:data.gymGoal,english_general:data.englishGoal})[id] ?? tracker(id)?.goal}
function englishTotalN(n=7){return dates(n).reduce((total,date)=>total+englishMinutesForDate(date),0)}
function englishTodayN(){return englishMinutesForDate(localDate())}
function dailyComplete(id,d=localDate()){
 const t=tracker(id);if(!t)return false;const v=data.logs[d]?.[id];if(t.type==='boolean')return v===true;
 const g=goalFor(id);if(!g)return v!==undefined&&v!==null&&v!=='';return Number(v)>=Number(g)
}
function completion(id,n=7){
 if(id==='gym')return pct(boolCount('gym',n),Math.max(1,data.gymGoal*(n/7)));
 if(id==='english_general')return pct(englishTotalN(n),Math.max(1,data.englishGoal*(n/7)));
 return pct(dates(n).filter(d=>dailyComplete(id,d)).length,n)
}



const TRACKER_I18N = {
  protein:{ru:'Белок',en:'Protein',unitRu:'г',unitEn:'g'},
  steps:{ru:'Шаги',en:'Steps',unitRu:'',unitEn:''},
  outdoors:{ru:'Время на улице',en:'Time outdoors',unitRu:'мин',unitEn:'min'},
  sleep:{ru:'Сон',en:'Sleep',unitRu:'ч',unitEn:'h'},
  weight:{ru:'Вес',en:'Weight',unitRu:'кг',unitEn:'kg'},
  gym:{ru:'Тренировка',en:'Workout',unitRu:'',unitEn:''},
  english_general:{ru:'Английский',en:'English',unitRu:'мин',unitEn:'min'}
};

function trTrackerName(t){
  const lang=data.language||'ru';
  const d=TRACKER_I18N[t?.id];
  if(d) return lang==='en'?d.en:d.ru;
  return t?.name||'';
}
function trUnit(tOrId){
  const lang=data.language||'ru';
  const id=typeof tOrId==='string'?tOrId:tOrId?.id;
  const d=TRACKER_I18N[id];
  if(d) return lang==='en'?d.unitEn:d.unitRu;
  const t=typeof tOrId==='string'?tracker(tOrId):tOrId;
  return t?.unit||'';
}
function trText(ru,en){ return (data.language||'ru')==='en'?en:ru; }

const UI_EN = new Map([
['Current path','Current path'],
['This week','This week'],
['Words & Phrases','Words & Phrases'],
['Grammar Rules','Grammar Rules'],
['My Mistakes','My Mistakes'],
['Review Queue','Review Queue'],
['Current focus','Current focus'],
['Study log','Study log'],
['Add a session','Add a session'],
['Today to review','Today to review'],
['Start review','Start review'],
['Today','Today'],
['1 год','1 year'],
['Всё время','All time'],
['Один показатель во времени — без дублирования Weekly Review.','One metric over time — without duplicating Weekly Review.'],
['Календарь','Calendar'],
['История заполнения по конкретным дням.','Logging history by individual day.'],
['3 месяца','3 months'],
['Weekly Review, детальная динамика и паттерны.','Weekly Review, detailed trends and patterns.'],
['Weekly Review','Weekly Review'],
['✨ Лучшее','✨ Strongest'],
['↗ Что изменилось','↗ What changed'],
['🎯 Фокус','🎯 Focus'],
['Настройки','Settings'],
['Цели, оформление, резервные копии и служебные функции.','Goals, appearance, backups and service tools.'],
['🎯 Настройки целей','🎯 Goal settings'],
['🎨 Оформление и язык','🎨 Appearance and language'],
['Паттерны','Patterns'],
['🧰 Диагностика данных','🧰 Data diagnostics'],
['Дней употребления алкоголя','Alcohol drinking days'],
['⚗️ Расширенные настройки','⚗️ Advanced settings'],
['Опасная зона','Danger zone'],
['Сброс удаляет локальные данные приложения. Перед этим создай внешний backup.','Reset deletes the app’s local data. Create an external backup first.'],
['Локальная защита','Local protection'],
['Последний внешний backup','Last external backup'],
['Проверяем…','Checking…'],
['Никогда','Never'],
['локальных копий','local copies'],
['Backup создан. Сохрани файл в Files/iCloud Drive.','Backup created. Keep the file in Files/iCloud Drive.'],

['Вчера','Yesterday'],
['Нет записей','No entries'],
['За 7 дней','Last 7 days'],
['Среднее за 7 дней','7-day average'],
['Нет данных за последние 7 дней','No data in the last 7 days'],
['Цель достигнута','Goal reached'],
['Записать сегодня','Log today'],
['шагов','steps'],

['Сегодня отмечено ✓','Checked today ✓'],
['Нажми, чтобы отметить сегодня','Tap to check today'],

['Лучше, чем вчера','Better than yesterday'],
['Добавить занятие ＋','Add a session ＋'],
['Без сигарет','Smoke-free'],
['Без алкоголя','Alcohol-free'],
['Дисциплина сегодня — свобода завтра.','Discipline today — freedom tomorrow.'],

['🥩 Белок','🥩 Protein'],
['🚶 Шаги','🚶 Steps'],
['☀️ Время на улице','☀️ Time outdoors'],
['☀️ Улица','☀️ Outdoors'],
['😴 Сон','😴 Sleep'],
['⚖️ Вес','⚖️ Weight'],
['🏋️ Тренировка','🏋️ Workout'],
['🇬🇧 Английский','🇬🇧 English'],

['Мой ритм','My Rhythm'],
['Consistency > streak. Смотри на тренд, а не на один день.','Consistency > streak. Focus on the trend, not one day.'],
['сегодня','today'],
['Today Dashboard','Today Dashboard'],
['Начни день','Start your day'],
['Заполни несколько ключевых показателей.','Log a few key metrics.'],
['🚭 Без сигарет','🚭 Smoke-free'],
['🍷 Без алкоголя','🍷 Alcohol-free'],
['дней','days'],
['Ключевые показатели','Key metrics'],
['Быстрый ввод','Quick entry'],
['🥩 Белок','🥩 Protein'],
['☀️ Улица','☀️ Outdoors'],
['🏋️ Тренировка','🏋️ Workout'],
['Здоровье','Health'],
['Дневные и недельные цели без наказания за один пропуск.','Daily and weekly goals without punishing one missed day.'],
['＋ Добавить свой трекер','＋ Add custom tracker'],
['Английский','English'],
['Отдельный мини-трекер внутри приложения.','A dedicated mini-tracker inside the app.'],
['Сегодня','Today'],
['Эта неделя','This week'],
['мин','min'],
['Дней с английским','Days with English'],
['Добавить занятие','Add a session'],
['🎬 Смотреть','🎬 Watching'],
['Неделя по типам занятий','Week by activity type'],
['Прогресс','Progress'],
['7 дней','7 days'],
['30 дней','30 days'],
['Проверяй одну гипотезу за раз.','Test one hypothesis at a time.'],
['＋ Новый эксперимент','＋ New experiment'],
['Настройки целей','Goal settings'],
['Дата отказа от сигарет','Smoke-free start date'],
['Дата текущего периода без алкоголя','Current alcohol-free period start'],
['Белок, г/день','Protein, g/day'],
['Шаги / день','Steps / day'],
['Время на улице, мин/день','Time outdoors, min/day'],
['Сон, ч/день','Sleep, h/day'],
['Английский, мин/неделю','English, min/week'],
['Тренировки, раз/неделю','Workouts / week'],
['Сохранить настройки','Save settings'],
['🎨 Оформление','🎨 Appearance'],
['Тема приложения','App theme'],
['По умолчанию — тёмная неоновая','Default — dark neon'],
['Язык интерфейса','Interface language'],
['Русский / English','Russian / English'],
['Русский','Russian'],
['💾 Данные и резервная копия','💾 Data and backup'],
['Данные приложения хранятся отдельно от версии интерфейса. Обновления V4, V5 и дальше используют ту же базу.','Your data is stored separately from the interface version. V4, V5 and later use the same database.'],
['Версия приложения','App version'],
['Версия структуры данных','Data schema version'],
['↓ Экспорт backup','↓ Export backup'],
['↑ Импорт backup','↑ Import backup'],
['Сбросить все данные','Reset all data'],
['Главная','Home'],
['Здоровье','Health'],
['Прогресс','Progress'],
['Запись','Entry'],
['Значение','Value'],
['Сохранить','Save'],
['Название','Name'],
['Иконка','Icon'],
['Тип','Type'],
['Число','Number'],
['Да / нет','Yes / no'],
['Единица','Unit'],
['мин, г, мл...','min, g, ml...'],
['Дневная цель','Daily goal'],
['Добавить','Add'],
['Длительность, дней','Duration, days'],
['Гипотеза','Hypothesis'],
['Начать эксперимент','Start experiment'],
['Белок','Protein'],
['Шаги','Steps'],
['Время на улице','Time outdoors'],
['Сон','Sleep'],
['Вес','Weight'],
['Вода','Water'],
['Тренировка','Workout'],
['Английский','English'],
['г','g'],
['ч','h'],
['кг','kg'],
['л','L'],
['Выполнено','Done'],
['Не отмечено','Not logged'],
['Записать','Log'],
['цель','goal'],
['Неделя','Week'],
['Очень хороший день','Great day'],
['Хороший темп','Good pace'],
['День в процессе','Day in progress'],
['Начни с малого','Start small'],
['Главное — устойчивость, а не идеальный день.','Consistency matters more than a perfect day.'],
['Заполни 2–3 важных показателя — уже достаточно.','Logging 2–3 important metrics is already enough.'],
['Пока мало данных.','Not enough data yet.'],
['Без гипотезы','No hypothesis'],
['Активен','Active'],
['Завершён','Completed'],
['Завершить','Finish'],
['Возобновить','Resume'],
['Удалить','Delete'],
['Цель','Goal'],
['Январь','January'],['Февраль','February'],['Март','March'],['Апрель','April'],
['Май','May'],['Июнь','June'],['Июль','July'],['Август','August'],
['Сентябрь','September'],['Октябрь','October'],['Ноябрь','November'],['Декабрь','December'],
['Пн','Mon'],['Вт','Tue'],['Ср','Wed'],['Чт','Thu'],['Пт','Fri'],['Сб','Sat'],['Вс','Sun']
]);

function translatePhraseRUtoEN(text){
  if(UI_EN.has(text)) return UI_EN.get(text);
  let s=text;

  const exact={
    'Белок':'Protein','Шаги':'Steps','Время на улице':'Time outdoors','Улица':'Outdoors',
    'Сон':'Sleep','Вес':'Weight','Тренировка':'Workout','Английский':'English',
    'Сегодня':'Today','Эта неделя':'This week','Неделя':'Week',
    'Дневная цель':'Daily goal','Недельная цель':'Weekly goal','Без дневной цели':'No daily goal',
    'Выполнено':'Done','Не отмечено':'Not logged','Без цели':'No goal',
    'Активен':'Active','Завершён':'Completed','Завершить':'Finish','Возобновить':'Resume',
    'Удалить':'Delete','Записать':'Log','Добавить':'Add'
  };
  if(exact[s]) return exact[s];

  s=s.replace(/^Сегодня · /,'Today · ');
  s=s.replace(/^Недельная цель · /,'Weekly goal · ');
  s=s.replace(/^Дневная цель · /,'Daily goal · ');
  s=s.replace(/^Цель: /,'Goal: ');
  s=s.replace(/^цель: /,'goal: ');
  s=s.replace(/^Неделя (\d+)%$/,'Week $1%');
  s=s.replace(/^Completion rate за (\d+) дней$/,'Completion rate for $1 days');
  s=s.replace(/^Данных: (\d+) дней · корреляция, не доказательство причины$/,
              'Data: $1 days · correlation, not proof of causation');

  s=s.replace(/(\d+(?:[.,]\d+)?)\s*дней\b/g,'$1 days');
  s=s.replace(/(\d+(?:[.,]\d+)?)\s*дня\b/g,'$1 days');
  s=s.replace(/(\d+(?:[.,]\d+)?)\s*день\b/g,'$1 day');
  s=s.replace(/(\d+(?:[.,]\d+)?)\s*мин\b/g,'$1 min');
  s=s.replace(/(\d+(?:[.,]\d+)?)\s*ч\b/g,'$1 h');
  s=s.replace(/(\d+(?:[.,]\d+)?)\s*г\b/g,'$1 g');
  s=s.replace(/(\d+(?:[.,]\d+)?)\s*кг\b/g,'$1 kg');

  s=s.replace('Главное — устойчивость, а не идеальный день.',
              'Consistency matters more than a perfect day.');
  s=s.replace('Заполни 2–3 важных показателя — уже достаточно.',
              'Logging 2–3 important metrics is already enough.');
  s=s.replace('Заполни несколько ключевых показателей.',
              'Log a few key metrics.');
  s=s.replace('Для первых сравнений желательно хотя бы 8–14 заполненных дней, для более устойчивых выводов — около месяца.',
              'For initial comparisons, aim for at least 8–14 logged days; around a month gives more stable insights.');
  s=s.replace('Будем показывать связи, а не утверждать причинность.',
              'The app shows relationships, not claims of causation.');
  s=s.replace('Пример: «30 дней проводить ≥60 минут на улице» и потом сравнить сон и английский.',
              'Example: “Spend ≥60 minutes outdoors for 30 days” and then compare sleep and English.');

  s=s.replace(/^В дни с ≥(.+) мин на улице английского в среднем (.+) мин против (.+) мин\.$/,
              'On days with ≥$1 min outdoors, English averaged $2 min vs $3 min.');
  s=s.replace(/^При сне ≥(.+) ч английского в среднем (.+) мин против (.+) мин\.$/,
              'With ≥$1 h of sleep, English averaged $2 min vs $3 min.');
  s=s.replace(/^В дни с ≥(.+) мин на улице сон в среднем (.+) ч против (.+) ч\.$/,
              'On days with ≥$1 min outdoors, sleep averaged $2 h vs $3 h.');

  s=s.replace(/Белок/g,'Protein')
     .replace(/Шаги/g,'Steps')
     .replace(/Время на улице/g,'Time outdoors')
     .replace(/Сон/g,'Sleep')
     .replace(/Вес/g,'Weight')
     .replace(/Тренировка/g,'Workout')
     .replace(/Английский/g,'English');

  return s;
}

function translateDOM(){
  const lang=data.language||'ru';
  document.documentElement.lang=lang;

  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode()){
    const node=walker.currentNode;
    if(!node.parentElement) continue;
    const tag=node.parentElement.tagName;
    if(tag==='SCRIPT'||tag==='STYLE') continue;
    nodes.push(node);
  }

  nodes.forEach(node=>{
    if(node._ruText===undefined) node._ruText=node.nodeValue;
    node.nodeValue=lang==='en'?translatePhraseRUtoEN(node._ruText):node._ruText;
  });

  document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{
    if(el._ruPlaceholder===undefined) el._ruPlaceholder=el.getAttribute('placeholder')||'';
    el.setAttribute('placeholder',lang==='en'?translatePhraseRUtoEN(el._ruPlaceholder):el._ruPlaceholder);
  });

  const lb=document.getElementById('languageToggleBtn');
  if(lb) lb.textContent=lang==='en'?'English':'Русский';

  // Browser title.
  document.title=lang==='en'?'My Rhythm':'Мой ритм';
}

function toggleLanguage(){
  data.language=(data.language||'ru')==='ru'?'en':'ru';
  save();
}

function applyTheme(){
  const theme=data.theme||'dark';
  document.body.classList.toggle('light',theme==='light');
  const btn=document.getElementById('themeToggleBtn');
  if(btn) btn.textContent=theme==='dark'?'Dark':'Light';
}
function toggleTheme(){
  data.theme=(data.theme||'dark')==='dark'?'light':'dark';
  save();
}
function show(id,btn){
 const section=document.getElementById(id);
 if(!section||!btn){console.warn('Navigation target missing',id);return}
 document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));
 section.classList.add('active');
 document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
 btn.classList.add('active');
}
function openEntry(id,dateKey=localDate()){activeTracker=tracker(id);if(!activeTracker){alert(trText('Трекер не найден.','Tracker not found.'));return}activeTracker={...activeTracker,entryDate:dateKey};const unit=trUnit(activeTracker);document.getElementById('entryTitle').textContent=activeTracker.icon+' '+trTrackerName(activeTracker);document.getElementById('entryLabel').textContent=trText('Значение','Value')+(unit?' ('+unit+')':'')+' · '+dateKey;document.getElementById('entryValue').value=val(id,dateKey)??'';document.getElementById('entryModal').classList.add('show');setTimeout(()=>document.getElementById('entryValue').focus(),80)}
function openEnglish(id){const type=englishTypes.find(x=>x[0]===id);if(!type)return;activeTracker={id,name:type[2],icon:type[1],type:'number',unit:'мин',category:'english'};document.getElementById('entryTitle').textContent=type[1]+' '+type[2];document.getElementById('entryLabel').textContent=trText('Всего минут сегодня','Total minutes today');document.getElementById('entryValue').value=val(id)??'';document.getElementById('entryModal').classList.add('show');setTimeout(()=>document.getElementById('entryValue').focus(),80)}
function saveEntry(){
 if(!activeTracker)return;
 const input=document.getElementById('entryValue');
 const raw=input?.value?.trim()||'';
 const value=Number(raw);
 if(raw==='' || !Number.isFinite(value) || value<0){
   alert(trText('Введи число не меньше нуля. Пустое поле не сохраняется.','Enter a number of zero or more. An empty field is not saved.'));
   return;
 }
 ensureDay(activeTracker.entryDate||localDate())[activeTracker.id]=value;
 if(activeTracker.id.startsWith('english_') && activeTracker.id!=='english_general'){
   const total=englishTypes.reduce((s,[id])=>s+(Number(val(id))||0),0);
   ensureDay().english_general=total;
 }
 closeModal('entryModal');save()
}
function toggleBool(id){ensureDay()[id]=!ensureDay()[id];save()}
function closeModal(id){document.getElementById(id).classList.remove('show')}
function saveSettings(){const gv=id=>document.getElementById(id)?.value;data.smokeDate=gv('smokeDate')||'';data.alcoholDate=Object.keys(alcoholHistory()).length?alcoholCurrentStreakStart():(gv('alcoholDate')||'');data.proteinGoal=Number(gv('proteinGoal')||120);data.stepsGoal=Number(gv('stepsGoal')||7000);data.outdoorsGoal=Number(gv('outdoorsGoal')||60);data.sleepGoal=Number(gv('sleepGoal')||7.5);data.englishGoal=Number(gv('englishGoal')||240);data.gymGoal=Number(gv('gymGoal')||3);const map={protein:data.proteinGoal,steps:data.stepsGoal,outdoors:data.outdoorsGoal,sleep:data.sleepGoal};Object.entries(map).forEach(([id,g])=>{const t=tracker(id);if(t)t.goal=g});save()}
function exportBackup(){
  const now=new Date();
  const stamp=now.toISOString().slice(0,10);

  data.lastExternalBackupAt=now.toISOString();
  persistData({renderAfter:false,makeSnapshot:true});

  const backup={
    format:'my-life-tracker-backup',
    formatVersion:1,
    exportedAt:now.toISOString(),
    appVersion:APP_VERSION,
    schemaVersion:CURRENT_SCHEMA_VERSION,
    data:migrateData(data)
  };

  const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=`my-life-tracker-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);

  const el=document.getElementById('backupStatus');
  if(el)el.textContent=trText('Backup создан. Сохрани файл в Files/iCloud Drive.','Backup created. Keep the file in Files/iCloud Drive.');
  updateStorageSafetyUI();
}

function validateBackupObject(obj){
  if(!obj || typeof obj!=='object') throw new Error('Некорректный JSON.');
  if(obj.format==='my-life-tracker-backup' && obj.data){
    return migrateData(validateStoredData(obj.data));
  }
  // Also accept a raw database export for resilience.
  if(obj.logs || obj.trackers || obj.schemaVersion!==undefined){
    return migrateData(validateStoredData(obj));
  }
  throw new Error('Файл не похож на backup приложения «Мой ритм».');
}

function importBackupFile(event){
  const file=event.target.files && event.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=async()=>{
    try{
      const parsed=JSON.parse(reader.result);
      const imported=validateBackupObject(parsed);
      const hasCurrent=Object.keys(data.logs||{}).length>0;
      const message=hasCurrent
        ? 'Импорт заменит текущие записи данными из backup. Продолжить?'
        : 'Импортировать данные из backup?';
      if(!confirm(message)) return;
      await writeVaultCopies(structuredClone(data),true);
      data=imported;
      save();
      const el=document.getElementById('backupStatus');
      if(el) el.textContent='Backup успешно импортирован ✅';
      alert('Данные восстановлены.');
    }catch(err){
      alert('Не удалось импортировать backup: '+err.message);
    }finally{
      event.target.value='';
    }
  };
  reader.onerror=()=>alert('Не удалось прочитать файл.');
  reader.readAsText(file);
}

async function resetAll(){
  const first=confirm(
    (data.language||'ru')==='en'
      ? 'Delete all app data? This will also erase local recovery copies.'
      : 'Удалить все данные приложения? Будут удалены и локальные recovery-копии.'
  );
  if(!first)return;

  const second=confirm(
    (data.language||'ru')==='en'
      ? 'Final confirmation. Continue only if you already have an external backup.'
      : 'Последнее подтверждение. Продолжай только если у тебя уже есть внешний backup.'
  );
  if(!second)return;

  await clearVaultCopies();
  location.reload();
}




let bodySelectedMetric='waist';
let bodyRangeDays='all';
let bodySelectedPoint=null;
let bodyEditingDate='';

const BODY_METRICS=[
  {id:'weight',icon:'⚖️',ru:'Вес',en:'Weight',unitRu:'кг',unitEn:'kg'},
  {id:'chest',icon:'◯',ru:'Грудь',en:'Chest',unitRu:'см',unitEn:'cm'},
  {id:'waist',icon:'⌁',ru:'Талия',en:'Waist',unitRu:'см',unitEn:'cm'},
  {id:'abdomen',icon:'◌',ru:'Живот',en:'Abdomen',unitRu:'см',unitEn:'cm'},
  {id:'hips',icon:'◒',ru:'Бёдра',en:'Hips',unitRu:'см',unitEn:'cm'},
  {id:'thigh',icon:'◐',ru:'Бедро',en:'Thigh',unitRu:'см',unitEn:'cm'}
];

function bodyMetricDef(id){return BODY_METRICS.find(x=>x.id===id)||BODY_METRICS[0]}
function bodyMetricName(id){const m=bodyMetricDef(id);return (data.language||'ru')==='en'?m.en:m.ru}
function bodyMetricUnit(id){const m=bodyMetricDef(id);return (data.language||'ru')==='en'?m.unitEn:m.unitRu}

function bodyStore(){
  if(!data.bodyMeasurements||typeof data.bodyMeasurements!=='object')data.bodyMeasurements={};
  return data.bodyMeasurements;
}

function bodyEntries(metricId){
  const out=[];
  if(metricId==='weight'){
    for(const date of Object.keys(data.logs||{}).sort()){
      const v=Number(data.logs?.[date]?.weight);
      if(Number.isFinite(v)&&v>0)out.push({date,value:v});
    }
  }else{
    for(const date of Object.keys(bodyStore()).sort()){
      const v=Number(bodyStore()?.[date]?.[metricId]);
      if(Number.isFinite(v)&&v>0)out.push({date,value:v});
    }
  }
  return out;
}

function bodyLatest(metricId){
  const rows=bodyEntries(metricId);
  return rows.length?rows[rows.length-1]:null;
}
function bodyPrevious(metricId){
  const rows=bodyEntries(metricId);
  return rows.length>1?rows[rows.length-2]:null;
}
function bodyFirst(metricId){
  const rows=bodyEntries(metricId);
  return rows.length?rows[0]:null;
}
function bodyFormatNumber(v){
  if(v===null||v===undefined||v==='')return '—';
  const n=Number(v);
  if(!Number.isFinite(n))return '—';
  return Number.isInteger(n)?String(n):String(Math.round(n*10)/10);
}
function bodyFormatDelta(v,unit=''){
  if(v===null||v===undefined)return '—';
  if(v===0)return `0${unit?' '+unit:''}`;
  return `${v>0?'+':'−'}${bodyFormatNumber(Math.abs(v))}${unit?' '+unit:''}`;
}
function bodyFriendlyDate(dateKey,short=false){
  if(!dateKey)return '—';
  const d=new Date(dateKey+'T12:00:00');
  const locale=(data.language||'ru')==='en'?'en-NZ':'ru-RU';
  return d.toLocaleDateString(locale,short?{day:'numeric',month:'short'}:{day:'numeric',month:'short',year:'numeric'});
}
function bodyLatestCheckinDate(){
  const dates=Object.keys(bodyStore()).filter(d=>{
    const row=bodyStore()[d];
    return row&&typeof row==='object'&&Object.values(row).some(v=>Number(v)>0);
  }).sort();
  return dates.length?dates[dates.length-1]:'';
}
function bodyFieldCount(dateKey){
  const row=bodyStore()?.[dateKey]||{};
  return ['chest','waist','abdomen','hips','thigh'].filter(k=>Number(row[k])>0).length;
}

function openBody(){
  document.getElementById('bodyModal')?.classList.add('show');
  document.body.style.overflow='hidden';
  renderBody();
}
function closeBody(){
  document.getElementById('bodyModal')?.classList.remove('show');
  document.body.style.overflow='';
}
function setBodyMetric(id){
  bodySelectedMetric=id;
  bodySelectedPoint=null;
  renderBody();
}
function setBodyRange(range){
  if(![7,30,90,365,'all'].includes(range))range='all';
  bodyRangeDays=range;
  bodySelectedPoint=null;
  renderBody();
}

function openBodyCheckin(dateKey=''){
  bodyEditingDate=dateKey||'';
  const date=dateKey||localDate();
  document.getElementById('bodyDateInput').value=date;

  const row=bodyStore()?.[date]||{};
  const log=data.logs?.[date]||{};

  document.getElementById('bodyWeightInput').value=log.weight??'';
  document.getElementById('bodyChestInput').value=row.chest??'';
  document.getElementById('bodyWaistInput').value=row.waist??'';
  document.getElementById('bodyAbdomenInput').value=row.abdomen??'';
  document.getElementById('bodyHipsInput').value=row.hips??'';
  document.getElementById('bodyThighInput').value=row.thigh??'';

  const exists=!!dateKey && (
    Object.keys(row).length>0 ||
    (log.weight!==undefined&&log.weight!==null&&log.weight!=='')
  );

  const del=document.getElementById('bodyDeleteBtn');
  if(del)del.style.display=exists?'block':'none';

  translateBodyCheckin();
  document.getElementById('bodyCheckinModal')?.classList.add('show');
}
function closeBodyCheckin(){
  document.getElementById('bodyCheckinModal')?.classList.remove('show');
  bodyEditingDate='';
}

function numberOrNull(id){
  const raw=document.getElementById(id)?.value?.trim();
  if(raw===''||raw===undefined)return null;
  const n=Number(raw);
  return Number.isFinite(n)&&n>0?n:null;
}

function saveBodyCheckin(){
  const date=document.getElementById('bodyDateInput')?.value;
  if(!date)return alert(trText('Выбери дату.','Choose a date.'));
  if(date>localDate())return alert(trText('Нельзя записать будущую дату.','Future dates cannot be logged.'));

  const vals={
    weight:numberOrNull('bodyWeightInput'),
    chest:numberOrNull('bodyChestInput'),
    waist:numberOrNull('bodyWaistInput'),
    abdomen:numberOrNull('bodyAbdomenInput'),
    hips:numberOrNull('bodyHipsInput'),
    thigh:numberOrNull('bodyThighInput')
  };

  if(!data.logs[date])data.logs[date]={};
  if(vals.weight!==null)data.logs[date].weight=vals.weight;
  else delete data.logs[date].weight;
  if(Object.keys(data.logs[date]).length===0)delete data.logs[date];

  const row={};
  for(const key of ['chest','waist','abdomen','hips','thigh']){
    if(vals[key]!==null)row[key]=vals[key];
  }
  if(Object.keys(row).length)bodyStore()[date]=row;
  else delete bodyStore()[date];

  persistData({renderAfter:true,makeSnapshot:true});
  closeBodyCheckin();
  renderBody();
}

function deleteBodyCheckin(){
  const date=bodyEditingDate||document.getElementById('bodyDateInput')?.value;
  if(!date)return;
  const ok=confirm(trText(`Удалить Body Check-in за ${bodyFriendlyDate(date)}?`,`Delete Body Check-in for ${bodyFriendlyDate(date)}?`));
  if(!ok)return;

  if(data.bodyMeasurements)delete data.bodyMeasurements[date];
  if(data.logs?.[date]){
    delete data.logs[date].weight;
    if(Object.keys(data.logs[date]).length===0)delete data.logs[date];
  }

  persistData({renderAfter:true,makeSnapshot:true});
  closeBodyCheckin();
  renderBody();
}

function translateBodyCheckin(){
  const set=(id,ru,en)=>{const el=document.getElementById(id);if(el)el.textContent=trText(ru,en)};
  set('bodyCheckinTitle','Body Check-in','Body Check-in');
  set('bodyDateLabel','Дата','Date');
  set('bodyWeightInputLabel','⚖️ Вес, кг','⚖️ Weight, kg');
  set('bodyChestInputLabel','Грудь, см','Chest, cm');
  set('bodyWaistInputLabel','Талия, см','Waist, cm');
  set('bodyAbdomenInputLabel','Живот, см','Abdomen, cm');
  set('bodyHipsInputLabel','Бёдра, см','Hips, cm');
  set('bodyThighInputLabel','Бедро, см','Thigh, cm');
  set('bodyCheckinNote','Можно заполнить только те показатели, которые измерил сегодня.','Fill only the measurements you took today.');
  set('bodySaveBtn','Сохранить замер','Save check-in');
  set('bodyDeleteBtn','Удалить замер','Delete check-in');
}


function bodyMetricRawSeries(metricId){
  const today=localDate();
  let start;

  if(bodyRangeDays==='all'){
    const rows=bodyEntries(metricId);
    if(!rows.length)return [];
    start=rows[0].date;
  }else{
    start=trendAddDays(today,-(Number(bodyRangeDays)-1));
  }

  const out=[];
  let index=0;
  for(let d=start;;d=trendAddDays(d,1)){
    let value=null;
    if(metricId==='weight'){
      const n=Number(data.logs?.[d]?.weight);
      if(Number.isFinite(n)&&n>0)value=n;
    }else{
      const n=Number(bodyStore()?.[d]?.[metricId]);
      if(Number.isFinite(n)&&n>0)value=n;
    }
    out.push({date:d,startDate:d,endDate:d,index,bucket:'day',value,logged:value!==null?1:0});
    if(d>=today)break;
    index++;
  }
  return out;
}
function bodyAggregate(metricId,daily,mode){
  if(!daily.length)return [];

  let starts=[],bucket='day';
  if(mode==='week'){
    bucket='week';
    const first=trendMonday(daily[0].date),last=trendMonday(daily[daily.length-1].date);
    for(let s=first;;s=trendAddDays(s,7)){starts.push(s);if(s===last)break}
  }else if(mode==='month'){
    bucket='month';
    starts=trendLast12MonthStarts();
  }else if(mode==='quarter'){
    bucket='quarter';
    const first=trendQuarterStart(daily[0].date),last=trendQuarterStart(daily[daily.length-1].date);
    for(let s=first;;s=trendAddMonths(s,3)){starts.push(s);if(s===last)break}
  }else{
    return daily;
  }

  return starts.map((startDate,index)=>{
    const endDate=bucket==='week'
      ?trendAddDays(startDate,6)
      :(bucket==='month'?trendMonthEnd(startDate):trendQuarterEnd(startDate));

    const vals=daily
      .filter(r=>r.date>=startDate&&r.date<=endDate&&r.value!==null)
      .map(r=>Number(r.value));

    return {
      date:startDate,startDate,endDate,index,bucket,
      value:vals.length?vals.reduce((s,v)=>s+v,0)/vals.length:null,
      logged:vals.length
    };
  });
}
function bodyChartSeries(metricId,daily){
  if(bodyRangeDays===90)return bodyAggregate(metricId,daily,'week');
  if(bodyRangeDays===365)return bodyAggregate(metricId,daily,'month');
  if(bodyRangeDays==='all')return bodyAggregate(metricId,daily,'quarter');
  return daily;
}
function bodyScale(metricId,series){
  const vals=series.filter(r=>r.value!==null).map(r=>Number(r.value));
  if(!vals.length)return {min:0,max:1};

  let min=Math.min(...vals),max=Math.max(...vals);
  const span=Math.max(metricId==='weight'?4:5,max-min);
  const center=(min+max)/2;
  min=Math.max(0,Math.floor((center-span/2-.4)*2)/2);
  max=Math.ceil((center+span/2+.4)*2)/2;
  return {min,max};
}
function bodyPeriodLabel(row){
  if(row.bucket==='week')return `${bodyFriendlyDate(row.startDate,true)} – ${bodyFriendlyDate(row.endDate,true)}`;
  if(row.bucket==='month')return trendFormatMonth(row.startDate);
  if(row.bucket==='quarter')return trendQuarterLabel(row.startDate,true);
  return bodyFriendlyDate(row.date);
}
function bodyXLabel(row){
  if(row.bucket==='month')return trendFormatMonthShort(row.startDate);
  if(row.bucket==='quarter')return trendQuarterLabel(row.startDate,true);
  if(row.bucket==='week')return bodyFriendlyDate(row.startDate,true);
  return bodyFriendlyDate(row.date,true);
}
function bodyChartNoteText(){
  if(bodyRangeDays===7)return trText('7 дней: отдельные замеры. Нажми на точку.','7 days: individual measurements. Tap a point.');
  if(bodyRangeDays===30)return trText('30 дней: отдельные замеры. Нажми на точку.','30 days: individual measurements. Tap a point.');
  if(bodyRangeDays===90)return trText('3 месяца: одна точка = среднее за календарную неделю.','3 months: one point = calendar-week average.');
  if(bodyRangeDays===365)return trText('1 год: 12 точек = средние значения по месяцам.','1 year: 12 points = monthly averages.');
  return trText('Всё время: одна точка = среднее значение за квартал.','All time: one point = quarterly average.');
}
function bodyChartHTML(metricId,series){
  return sharedChartHTML({
    series,
    scale:bodyScale(metricId,series),
    goal:null,
    selectedIndex:bodySelectedPoint,
    onSelectName:'selectBodyPoint',
    connectAcrossMissing:true,
    bars:false,
    emptyText:trText(
      'Для графика нужно минимум два замера в выбранном периоде.',
      'At least two measurements are needed in the selected range.'
    ),
    formatY:(v)=>bodyFormatNumber(v),
    periodLabel:(row)=>bodyPeriodLabel(row),
    formatX:(row)=>bodyXLabel(row)
  });
}
function selectBodyPoint(index){
  const daily=bodyMetricRawSeries(bodySelectedMetric);
  const series=bodyChartSeries(bodySelectedMetric,daily);
  const row=series[Number(index)];
  if(!row||row.value===null)return;

  bodySelectedPoint=Number(index);
  const detail=document.getElementById('bodyPointDetail');
  const period=document.getElementById('bodyPointDetailPeriod');
  const value=document.getElementById('bodyPointDetailValue');
  const meta=document.getElementById('bodyPointDetailMeta');

  if(detail)detail.hidden=false;
  if(period)period.textContent=bodyPeriodLabel(row);
  if(value)value.textContent=`${bodyFormatNumber(row.value)} ${bodyMetricUnit(bodySelectedMetric)}`;
  if(meta){
    meta.textContent=row.bucket==='day'
      ?trText('Точный замер','Exact measurement')
      :`${trText('Среднее по','Average across')} ${row.logged||0} ${trText('замерам','measurements')}`;
  }

  document.querySelectorAll('#bodyChartHost .trend-hit').forEach(el=>{
    el.classList.toggle('selected',Number(el.dataset.index)===bodySelectedPoint);
  });
}

function renderBody(){
  const modal=document.getElementById('bodyModal');
  if(!modal)return;

  const set=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text};

  set('bodyTitle','Body');
  set('bodySubtitle',trText('Замеры и динамика','Measurements & trends'));
  set('bodyWeightLabel',trText('Текущий вес','Current weight'));
  set('bodyLastCheckinLabel',trText('Последний замер','Last check-in'));
  set('bodyWaistLabel',trText('Талия','Waist'));
  set('bodyNewCheckinTitle',trText('Новый замер','New check-in'));
  set('bodyNewCheckinSub',trText('Вес + 5 измерений тела','Weight + 5 body measurements'));
  set('bodyDynamicsTitle',trText('Динамика','Trend'));
  set('bodyDynamicsSub',trText('Выбери показатель','Choose a metric'));
  set('bodyHistoryTitle',trText('История','History'));
  set('bodyHistorySub',trText('Нажми на запись, чтобы изменить её','Tap an entry to edit it'));
  set('bodyHelpTitle',trText('Для сравнимых замеров','For comparable measurements'));
  set('bodyHelpText',trText('Старайся измеряться примерно в одинаковых условиях и в одинаковых местах тела. Поля можно оставлять пустыми.','Try to measure under similar conditions and at the same body landmarks. Fields may be left blank.'));

  const weight=bodyLatest('weight'),weightPrev=bodyPrevious('weight');
  set('bodyLatestWeight',weight?`${bodyFormatNumber(weight.value)} ${bodyMetricUnit('weight')}`:'—');
  const wd=weight&&weightPrev?Math.round((weight.value-weightPrev.value)*10)/10:null;
  const wde=document.getElementById('bodyWeightDelta');
  if(wde){
    wde.textContent=wd===null?trText('Пока нет сравнения','No comparison yet'):`${bodyFormatDelta(wd,bodyMetricUnit('weight'))} ${trText('к предыдущему','vs previous')}`;
    wde.className='body-summary-delta '+(wd!==null&&wd<0?'good':'neutral');
  }

  const lastDate=bodyLatestCheckinDate();
  set('bodyLastCheckin',lastDate?bodyFriendlyDate(lastDate):'—');
  set('bodyLastCheckinFields',lastDate?`${bodyFieldCount(lastDate)} / 5 ${trText('замеров','measurements')}`:trText('Нет данных','No data'));

  const waist=bodyLatest('waist'),waistPrev=bodyPrevious('waist');
  set('bodyLatestWaist',waist?`${bodyFormatNumber(waist.value)} ${bodyMetricUnit('waist')}`:'—');
  const wad=waist&&waistPrev?Math.round((waist.value-waistPrev.value)*10)/10:null;
  const wae=document.getElementById('bodyWaistDelta');
  if(wae){
    wae.textContent=wad===null?trText('Пока нет сравнения','No comparison yet'):`${bodyFormatDelta(wad,bodyMetricUnit('waist'))} ${trText('к предыдущему','vs previous')}`;
    wae.className='body-summary-delta '+(wad!==null&&wad<0?'good':'neutral');
  }

  const tabs=document.getElementById('bodyMetricTabs');
  if(tabs){
    tabs.innerHTML=BODY_METRICS.map(m=>`<button class="body-metric-tab ${bodySelectedMetric===m.id?'active':''}" onclick="setBodyMetric('${m.id}')">${m.icon} ${(data.language||'ru')==='en'?m.en:m.ru}</button>`).join('');
  }

  const metric=bodyMetricDef(bodySelectedMetric);
  const rows=bodyEntries(bodySelectedMetric);
  const dailySeries=bodyMetricRawSeries(bodySelectedMetric);
  const chartSeries=bodyChartSeries(bodySelectedMetric,dailySeries);
  const visibleRows=dailySeries.filter(r=>r.value!==null);

  set('bodyChartTitle',`${metric.icon} ${bodyMetricName(bodySelectedMetric)}`);

  const first=visibleRows.length?visibleRows[0]:null;
  const last=visibleRows.length?visibleRows[visibleRows.length-1]:null;
  set(
    'bodyChartRange',
    visibleRows.length
      ?`${bodyFriendlyDate(first.date,true)} → ${bodyFriendlyDate(last.date,true)} · ${visibleRows.length} ${trText('замеров','measurements')}`
      :trText('Нет данных','No data')
  );

  const totalChange=first&&last&&visibleRows.length>1
    ?Math.round((last.value-first.value)*10)/10
    :null;
  const changeEl=document.getElementById('bodyChartChange');
  if(changeEl){
    changeEl.textContent=totalChange===null?'—':`${bodyFormatDelta(totalChange,bodyMetricUnit(bodySelectedMetric))} ${trText('за период','over range')}`;
    changeEl.className='body-chart-change';
  }

  [
    ['bodyRange7Btn',7],
    ['bodyRange30Btn',30],
    ['bodyRange90Btn',90],
    ['bodyRange365Btn',365],
    ['bodyRangeAllBtn','all']
  ].forEach(([id,value])=>{
    const el=document.getElementById(id);
    if(el)el.className=bodyRangeDays===value?'secondary':'ghost';
  });

  const chart=document.getElementById('bodyChartHost');
  if(chart)chart.innerHTML=bodyChartHTML(bodySelectedMetric,chartSeries);

  const note=document.getElementById('bodyChartNote');
  if(note)note.textContent=bodyChartNoteText();

  const detail=document.getElementById('bodyPointDetail');
  if(detail&&bodySelectedPoint===null)detail.hidden=true;
  if(bodySelectedPoint!==null){
    const selected=chartSeries[bodySelectedPoint];
    if(selected&&selected.value!==null)selectBodyPoint(bodySelectedPoint);
    else{
      bodySelectedPoint=null;
      if(detail)detail.hidden=true;
    }
  }

  const list=document.getElementById('bodyHistoryList');
  if(list){
    if(!rows.length){
      list.innerHTML=`<div class="body-history-empty">${trText('Для этого показателя ещё нет замеров.','No measurements for this metric yet.')}</div>`;
    }else{
      const desc=[...rows].reverse();
      list.innerHTML=desc.map((r,revIndex)=>{
        const originalIndex=rows.length-1-revIndex;
        const prev=originalIndex>0?rows[originalIndex-1]:null;
        const d=prev?Math.round((r.value-prev.value)*10)/10:null;
        return `<div class="body-history-row" onclick="openBodyCheckin('${r.date}')">
          <div>
            <div class="body-history-date">${bodyFriendlyDate(r.date)}</div>
            <div class="body-history-meta">${bodySelectedMetric==='weight'?trText('Вес','Weight'):trText('Body Check-in','Body Check-in')}</div>
          </div>
          <div>
            <div class="body-history-value">${bodyFormatNumber(r.value)} ${bodyMetricUnit(bodySelectedMetric)}</div>
            <div class="body-history-delta">${d===null?trText('Первая запись','First entry'):bodyFormatDelta(d,bodyMetricUnit(bodySelectedMetric))}</div>
          </div>
        </div>`;
      }).join('');
    }
  }
}

let alcoholViewMode='year';
let alcoholViewYear=new Date().getFullYear();
let alcoholViewMonth=new Date().getMonth();
const ALCOHOL_MONTHS_RU=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const ALCOHOL_MONTHS_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
const ALCOHOL_WEEK_RU=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const ALCOHOL_WEEK_EN=['Mo','Tu','We','Th','Fr','Sa','Su'];

function alcoholHistory(){
  if(!data.alcoholHistory||typeof data.alcoholHistory!=='object')data.alcoholHistory={};
  return data.alcoholHistory;
}
function alcoholIsDrink(dateKey){return !!alcoholHistory()[dateKey]}
function alcoholDateKey(year,monthIndex,day){return `${year}-${String(monthIndex+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`}
function alcoholParseLocal(dateKey){return weeklyParseDate(dateKey)}
function alcoholTodayKey(){return localDate()}
function alcoholTrackingStart(){return data.alcoholTrackingStart||data.alcoholDate||Object.keys(alcoholHistory()).filter(k=>alcoholHistory()[k]).sort()[0]||localDate()}
function alcoholIsTrackedPast(dateKey){return dateKey>=alcoholTrackingStart()&&dateKey<=alcoholTodayKey()}
function alcoholLatestDrink(onOrBefore=alcoholTodayKey()){return Object.keys(alcoholHistory()).filter(k=>alcoholHistory()[k]&&k<=onOrBefore).sort().pop()||''}

function alcoholCurrentStreakStart(){
  const today=alcoholTodayKey();
  if(alcoholIsDrink(today))return '';
  const lastDrink=alcoholLatestDrink(today);
  if(!lastDrink)return alcoholTrackingStart();
  const d=alcoholParseLocal(lastDrink);d.setDate(d.getDate()+1);return localDate(d);
}
function alcoholCurrentStreakDays(){
  const today=alcoholTodayKey();
  if(alcoholIsDrink(today))return 0;
  const startKey=alcoholCurrentStreakStart();
  if(!startKey||startKey>today)return 0;
  return Math.max(0,weeklyDiffDays(startKey,today));
}
function alcoholYearStats(year){
  const now=new Date(),currentYear=now.getFullYear(),trackStart=alcoholTrackingStart();
  const effectiveStart=`${year}-01-01`<trackStart?trackStart:`${year}-01-01`;
  let end;
  if(year<currentYear)end=new Date(year,11,31,12);
  else if(year===currentYear)end=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
  else return {tracked:0,drink:0,sober:0,pct:0};
  const start=alcoholParseLocal(effectiveStart);
  if(start>end)return {tracked:0,drink:0,sober:0,pct:0};
  const tracked=weeklyDiffDays(effectiveStart,localDate(end))+1;
  const endKey=localDate(end);
  const drink=Object.keys(alcoholHistory()).filter(k=>k.startsWith(year+'-')&&alcoholHistory()[k]&&k>=effectiveStart&&k<=endKey).length;
  const sober=Math.max(0,tracked-drink);
  return {tracked,drink,sober,pct:tracked?Math.round(sober/tracked*100):0};
}
function syncAlcoholDerivedDate(){data.alcoholDate=alcoholCurrentStreakStart()}

function openAlcohol(){
  alcoholViewYear=new Date().getFullYear();
  alcoholViewMonth=new Date().getMonth();
  alcoholViewMode='year';
  document.getElementById('alcoholModal')?.classList.add('show');
  document.body.style.overflow='hidden';
  renderAlcoholCalendar();
}
function closeAlcohol(){document.getElementById('alcoholModal')?.classList.remove('show');document.body.style.overflow=''}
function setAlcoholMode(mode){alcoholViewMode=mode==='month'?'month':'year';renderAlcoholCalendar()}
function changeAlcoholYear(delta){alcoholViewYear+=delta;renderAlcoholCalendar()}
function changeAlcoholMonth(delta){alcoholViewMonth+=delta;if(alcoholViewMonth<0){alcoholViewMonth=11;alcoholViewYear--}if(alcoholViewMonth>11){alcoholViewMonth=0;alcoholViewYear++}renderAlcoholCalendar()}

function toggleAlcoholDay(dateKey){
  if(!alcoholIsTrackedPast(dateKey))return;
  const hist=alcoholHistory();
  if(hist[dateKey])delete hist[dateKey];else hist[dateKey]=true;
  syncAlcoholDerivedDate();
  persistData({renderAfter:true,makeSnapshot:true});
  renderAlcoholCalendar();
}
function alcoholDayClass(dateKey){
  if(dateKey<alcoholTrackingStart())return 'untracked';
  if(dateKey>alcoholTodayKey())return 'future';
  return alcoholIsDrink(dateKey)?'drank':'sober';
}
function alcoholMonthHTML(year,monthIndex){
  const lang=data.language||'ru',months=lang==='en'?ALCOHOL_MONTHS_EN:ALCOHOL_MONTHS_RU,week=lang==='en'?ALCOHOL_WEEK_EN:ALCOHOL_WEEK_RU;
  const first=new Date(year,monthIndex,1,12),daysInMonth=new Date(year,monthIndex+1,0,12).getDate(),offset=(first.getDay()+6)%7;
  let days='';
  for(let i=0;i<offset;i++)days+='<button class="alcohol-day empty" tabindex="-1"></button>';
  for(let day=1;day<=daysInMonth;day++){
    const key=alcoholDateKey(year,monthIndex,day),cls=alcoholDayClass(key),today=key===alcoholTodayKey()?' today':'',disabled=(cls==='future'||cls==='untracked')?' disabled':'';
    const aria=alcoholIsDrink(key)?trText('Пил алкоголь','Drank alcohol'):(cls==='sober'?trText('Без алкоголя','Alcohol-free'):'');
    days+=`<button class="alcohol-day ${cls}${today}"${disabled} onclick="toggleAlcoholDay('${key}')" aria-label="${day} ${months[monthIndex]} ${year}. ${aria}">${day}</button>`;
  }
  return `<div class="alcohol-month-card"><div class="alcohol-month-title">${months[monthIndex]}</div><div class="alcohol-weekdays">${week.map(x=>`<span>${x}</span>`).join('')}</div><div class="alcohol-days-grid">${days}</div></div>`;
}
function renderAlcoholCalendar(){
  if(!document.getElementById('alcoholModal'))return;
  const lang=data.language||'ru',months=lang==='en'?ALCOHOL_MONTHS_EN:ALCOHOL_MONTHS_RU,streak=alcoholCurrentStreakDays(),stats=alcoholYearStats(alcoholViewYear);
  const setText=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text};
  setText('alcoholTitle',trText('Алкоголь','Alcohol'));setText('alcoholSubtitle',trText('История и календарь','History & calendar'));
  setText('alcoholCurrentLabel',trText('Текущая серия','Current streak'));setText('alcoholSoberYearLabel',trText('Без алкоголя в году','Alcohol-free this year'));setText('alcoholDrinkDaysLabel',trText('Дней с алкоголем','Drinking days'));
  setText('alcoholDaysUnit1',trText('дней','days'));setText('alcoholLegendSober',trText('Не пил','Alcohol-free'));setText('alcoholLegendDrank',trText('Пил','Drank'));setText('alcoholLegendFuture',trText('Будущий день','Future'));
  setText('alcoholHelpTitle',trText('Как это работает','How it works'));setText('alcoholHelpText',trText('Нажми на прошедший день, чтобы отметить или снять факт употребления алкоголя. Если день не отмечен, он автоматически считается днём без алкоголя.','Tap a past day to mark or unmark alcohol use. If a day is not marked, it is automatically treated as alcohol-free.'));
  const mb=document.getElementById('alcoholMonthModeBtn'),yb=document.getElementById('alcoholYearModeBtn');
  if(mb){mb.textContent=trText('Месяц','Month');mb.classList.toggle('active',alcoholViewMode==='month')}
  if(yb){yb.textContent=trText('Год','Year');yb.classList.toggle('active',alcoholViewMode==='year')}
  setText('alcoholHeaderStreak',streak);setText('alcoholCurrentStreak',streak);setText('alcoholSoberYear',stats.pct);setText('alcoholDrinkDaysYear',stats.drink);setText('alcoholYearLabel',alcoholViewYear);
  const host=document.getElementById('alcoholCalendarHost');if(!host)return;
  if(alcoholViewMode==='year'){
    host.innerHTML=`<div class="alcohol-year-grid">${Array.from({length:12},(_,m)=>alcoholMonthHTML(alcoholViewYear,m)).join('')}</div>`;
  }else{
    host.innerHTML=`<div class="alcohol-month-view"><div class="alcohol-month-switch"><button onclick="changeAlcoholMonth(-1)">‹</button><strong>${months[alcoholViewMonth]} ${alcoholViewYear}</strong><button onclick="changeAlcoholMonth(1)">›</button></div>${alcoholMonthHTML(alcoholViewYear,alcoholViewMonth)}</div>`;
  }
}


const MOTIVATION_SOURCES={
  acsSmoking:{
    name:'American Cancer Society',
    url:'https://www.cancer.org/cancer/risk-prevention/tobacco/guide-quitting-smoking/benefits-of-quitting-smoking-over-time.html'
  },
  cdcSmoking:{
    name:'CDC — Benefits of Quitting Smoking',
    url:'https://www.cdc.gov/tobacco/about/benefits-of-quitting.html'
  },
  cdcAlcohol:{
    name:'CDC — Alcohol Use and Your Health',
    url:'https://www.cdc.gov/alcohol/about-alcohol-use/index.html'
  },
  whoAlcohol:{
    name:'WHO — Alcohol and cancer',
    url:'https://www.who.int/europe/news-room/fact-sheets/item/alcohol-and-cancer'
  }
};

const MOTIVATION_GENERIC=[
  {ru:'Стабильность важнее идеального дня.',en:'Consistency matters more than a perfect day.'},
  {ru:'Маленькое действие сегодня облегчает большое действие завтра.',en:'A small action today makes the bigger action easier tomorrow.'},
  {ru:'Смотри на направление, а не на один отдельный день.',en:'Watch the direction, not one isolated day.'},
  {ru:'Результат складывается из обычных дней.',en:'Progress is built from ordinary days.'},
  {ru:'Не нужно сделать всё. Сделай то, что двигает тебя вперёд.',en:"You don't need to do everything. Do what moves you forward."},
  {ru:'Лучший ритм — тот, который можно повторить завтра.',en:'The best rhythm is one you can repeat tomorrow.'},
  {ru:'Записанный прогресс легче заметить — и легче продолжить.',en:'Tracked progress is easier to see — and easier to continue.'},
  {ru:'Один хороший выбор не меняет всё. Повторение — меняет.',en:"One good choice doesn't change everything. Repetition does."},
  {ru:'Сравнивай себя с собой неделю назад.',en:'Compare yourself with yourself a week ago.'},
  {ru:'Дисциплина сегодня — свобода завтра.',en:'Discipline today — freedom tomorrow.'}
];

const MOTIVATION_MILESTONES=[
  // Smoking — official recovery timeline
  {id:'smoke_1',group:'smoke',threshold:1,icon:'🚭',medical:true,source:'cdcSmoking',
   ru:'24 часа без сигарет',en:'24 hours smoke-free',
   detailRu:'После прекращения курения уровень никотина в крови падает до нуля примерно за 24 часа.',
   detailEn:'After quitting smoking, nicotine levels in the blood fall to zero at about 24 hours.'},
  {id:'smoke_3',group:'smoke',threshold:3,icon:'🚭',medical:true,source:'cdcSmoking',
   ru:'Несколько дней без сигарет',en:'Several days smoke-free',
   detailRu:'В течение нескольких дней уровень угарного газа в крови снижается до уровня человека, который не курит.',
   detailEn:"Within several days, carbon monoxide in the blood falls to the level of someone who doesn't smoke."},
  {id:'smoke_30',group:'smoke',threshold:30,icon:'🫁',medical:true,source:'acsSmoking',
   ru:'Месяц без сигарет',en:'One month smoke-free',
   detailRu:'В период от 1 до 12 месяцев после отказа от курения обычно уменьшаются кашель и одышка.',
   detailEn:'During the first 1–12 months after quitting, coughing and shortness of breath decrease.'},
  {id:'smoke_365',group:'smoke',threshold:365,icon:'❤️',medical:true,source:'acsSmoking',
   ru:'Год без сигарет',en:'One year smoke-free',
   detailRu:'Ты вошёл в период 1–2 лет после отказа от курения, когда риск сердечного приступа заметно снижается.',
   detailEn:'You are now in the 1–2 year period after quitting, when heart-attack risk drops dramatically.'},
  {id:'smoke_730',group:'smoke',threshold:730,icon:'❤️',medical:true,source:'acsSmoking',
   ru:'2 года без сигарет',en:'2 years smoke-free',
   detailRu:'К отметке 1–2 года после отказа от курения риск сердечного приступа заметно снижается.',
   detailEn:'By the 1–2 year mark after quitting, heart-attack risk drops dramatically.'},
  {id:'smoke_1825',group:'smoke',threshold:1825,icon:'🫁',medical:true,source:'acsSmoking',
   ru:'5 лет без сигарет',en:'5 years smoke-free',
   detailRu:'В период 5–10 лет после отказа риск рака полости рта, горла и гортани снижается примерно вдвое.',
   detailEn:'During the 5–10 year period after quitting, the risk of cancers of the mouth, throat and larynx is cut about in half.'},
  {id:'smoke_3650',group:'smoke',threshold:3650,icon:'🫁',medical:true,source:'acsSmoking',
   ru:'10 лет без сигарет',en:'10 years smoke-free',
   detailRu:'В период 10–15 лет после отказа риск рака лёгкого снижается примерно вдвое по сравнению с продолжающим курить человеком.',
   detailEn:'During the 10–15 year period after quitting, lung-cancer risk falls to about half that of a person who continues to smoke.'},
  {id:'smoke_5475',group:'smoke',threshold:5475,icon:'❤️',medical:true,source:'acsSmoking',
   ru:'15 лет без сигарет',en:'15 years smoke-free',
   detailRu:'Примерно через 15 лет риск ишемической болезни сердца становится близким к риску человека, который не курит.',
   detailEn:"At about 15 years, coronary heart disease risk becomes close to that of a person who doesn't smoke."},

  // Alcohol — no fake recovery timeline; use supported risk facts + achievement
  {id:'alcohol_7',group:'alcohol',threshold:7,icon:'🍷',medical:true,source:'cdcAlcohol',
   ru:'7 дней без алкоголя',en:'7 days alcohol-free',
   detailRu:'Первая полная неделя. CDC отмечает: чем меньше алкоголя человек употребляет, тем ниже связанные с алкоголем риски для здоровья.',
   detailEn:'A full week. CDC notes that drinking less alcohol lowers alcohol-related health risks.'},
  {id:'alcohol_14',group:'alcohol',threshold:14,icon:'🍷',
   ru:'2 недели без алкоголя',en:'2 weeks alcohol-free',
   detailRu:'Две недели подряд — это уже устойчивый отрезок, а не один удачный день.',
   detailEn:'Two consecutive weeks is already a sustained stretch, not just one good day.'},
  {id:'alcohol_30',group:'alcohol',threshold:30,icon:'🍷',medical:true,source:'whoAlcohol',
   ru:'30 дней без алкоголя',en:'30 days alcohol-free',
   detailRu:'Месяц без алкоголя. WHO указывает, что для риска рака не установлено безопасного уровня употребления алкоголя: меньше — безопаснее.',
   detailEn:'A month alcohol-free. WHO states that no safe level has been established for alcohol-related cancer risk: less is safer.'},
  {id:'alcohol_60',group:'alcohol',threshold:60,icon:'🍷',
   ru:'60 дней без алкоголя',en:'60 days alcohol-free',
   detailRu:'Два месяца последовательности. Календарь уже показывает изменение привычки, а не отдельные решения.',
   detailEn:'Two months of consistency. Your calendar now reflects a changed pattern, not isolated choices.'},
  {id:'alcohol_90',group:'alcohol',threshold:90,icon:'🍷',medical:true,source:'cdcAlcohol',
   ru:'90 дней без алкоголя',en:'90 days alcohol-free',
   detailRu:'Три месяца. Отказ от алкоголя — один из способов снизить связанные с его употреблением риски для здоровья.',
   detailEn:'Three months. Choosing not to drink is one way to lower alcohol-related health risks.'},
  {id:'alcohol_180',group:'alcohol',threshold:180,icon:'🍷',
   ru:'Полгода без алкоголя',en:'Six months alcohol-free',
   detailRu:'Полгода — длинный отрезок последовательного поведения. Посмотри на годовой календарь: это уже видимая история.',
   detailEn:'Six months is a long stretch of consistent behaviour. Your year calendar now shows a visible history.'},
  {id:'alcohol_365',group:'alcohol',threshold:365,icon:'🍷',medical:true,source:'whoAlcohol',
   ru:'Год без алкоголя',en:'One year alcohol-free',
   detailRu:'365 дней. WHO подчёркивает, что риск вреда от алкоголя в целом растёт с количеством употребляемого алкоголя.',
   detailEn:'365 days. WHO emphasizes that alcohol-related harm generally increases as alcohol consumption increases.'},

  // English — accumulated practice
  {id:'english_600',group:'english',threshold:600,icon:'🇬🇧',ru:'10 часов English',en:'10 hours of English',detailRu:'Ты накопил первые 600 минут практики.',detailEn:'You have accumulated your first 600 minutes of practice.'},
  {id:'english_1500',group:'english',threshold:1500,icon:'🇬🇧',ru:'25 часов English',en:'25 hours of English',detailRu:'1 500 минут английского уже лежат в твоей истории.',detailEn:'1,500 minutes of English are now in your history.'},
  {id:'english_3000',group:'english',threshold:3000,icon:'🇬🇧',ru:'50 часов English',en:'50 hours of English',detailRu:'3 000 минут практики — хороший момент посмотреть, какие навыки стали легче.',detailEn:'3,000 minutes of practice is a good point to notice which skills now feel easier.'},
  {id:'english_6000',group:'english',threshold:6000,icon:'🇬🇧',ru:'100 часов English',en:'100 hours of English',detailRu:'Ты накопил 100 часов реальной практики.',detailEn:'You have accumulated 100 hours of real practice.'},
  {id:'english_12000',group:'english',threshold:12000,icon:'🇬🇧',ru:'200 часов English',en:'200 hours of English',detailRu:'12 000 минут практики — уже большая собственная история обучения.',detailEn:'12,000 minutes of practice is a substantial personal learning history.'},

  // Gym total
  {id:'gym_5',group:'gym',threshold:5,icon:'🏋️',ru:'5 тренировок',en:'5 workouts',detailRu:'Первые пять тренировок записаны. Продолжай строить повторяемый ритм.',detailEn:'Your first five workouts are logged. Keep building a repeatable rhythm.'},
  {id:'gym_10',group:'gym',threshold:10,icon:'🏋️',ru:'10 тренировок',en:'10 workouts',detailRu:'Десять тренировок — уже не случайность.',detailEn:'Ten workouts is no longer a coincidence.'},
  {id:'gym_25',group:'gym',threshold:25,icon:'🏋️',ru:'25 тренировок',en:'25 workouts',detailRu:'Четверть сотни тренировок в истории My Rhythm.',detailEn:'Twenty-five workouts are now part of your My Rhythm history.'},
  {id:'gym_50',group:'gym',threshold:50,icon:'🏋️',ru:'50 тренировок',en:'50 workouts',detailRu:'50 тренировок. Посмотри, как изменились вес и замеры тела за этот период.',detailEn:'50 workouts. Compare your weight and body measurements across the same period.'},

  // Protein longest goal streak
  {id:'protein_3',group:'protein',threshold:3,icon:'🥩',ru:'3 дня белка подряд',en:'3 protein-goal days in a row',detailRu:'Три дня подряд ты достигал своей текущей цели по белку.',detailEn:'You reached your current protein goal three days in a row.'},
  {id:'protein_7',group:'protein',threshold:7,icon:'🥩',ru:'Неделя по цели белка',en:'A full week on your protein goal',detailRu:'Семь дней подряд с выполненной целью по белку.',detailEn:'Seven consecutive days meeting your protein goal.'},
  {id:'protein_14',group:'protein',threshold:14,icon:'🥩',ru:'14 дней по цели белка',en:'14 days on your protein goal',detailRu:'Две недели подряд с выполненной целью по белку.',detailEn:'Two consecutive weeks meeting your protein goal.'},

  // Steps longest goal streak
  {id:'steps_3',group:'steps',threshold:3,icon:'🚶',ru:'3 дня по цели шагов',en:'3 step-goal days in a row',detailRu:'Три дня подряд ты достигал своей цели по шагам.',detailEn:'You reached your step goal three days in a row.'},
  {id:'steps_7',group:'steps',threshold:7,icon:'🚶',ru:'Неделя по цели шагов',en:'A full week on your step goal',detailRu:'Семь дней подряд с выполненной целью по шагам.',detailEn:'Seven consecutive days meeting your step goal.'},
  {id:'steps_14',group:'steps',threshold:14,icon:'🚶',ru:'14 дней по цели шагов',en:'14 days on your step goal',detailRu:'Две недели подряд с выполненной целью по шагам.',detailEn:'Two consecutive weeks meeting your step goal.'},

  // Sleep tracking
  {id:'sleep_7',group:'sleep',threshold:7,icon:'😴',ru:'7 ночей сна записано',en:'7 nights of sleep logged',detailRu:'У тебя уже есть неделя данных сна — теперь тренд становится полезнее одного отдельного значения.',detailEn:'You now have a week of sleep data, so the trend is becoming more useful than a single value.'},
  {id:'sleep_30',group:'sleep',threshold:30,icon:'😴',ru:'30 ночей сна записано',en:'30 nights of sleep logged',detailRu:'Месяц данных сна. Уже можно сравнивать недели между собой.',detailEn:'A month of sleep data. You can now compare weeks more meaningfully.'},
  {id:'sleep_90',group:'sleep',threshold:90,icon:'😴',ru:'90 ночей сна записано',en:'90 nights of sleep logged',detailRu:'Три месяца наблюдений за сном — сильная база для персональных трендов.',detailEn:'Three months of sleep observations is a strong base for personal trends.'},

  // Body check-ins
  {id:'body_1',group:'body',threshold:1,icon:'📏',ru:'Первый Body Check-in',en:'First Body Check-in',detailRu:'Первая точка есть. Следующий замер превратит число в динамику.',detailEn:'Your first point is in. The next measurement turns a number into a trend.'},
  {id:'body_5',group:'body',threshold:5,icon:'📏',ru:'5 Body Check-ins',en:'5 Body Check-ins',detailRu:'У тебя уже пять точек замеров тела — графики начинают рассказывать историю.',detailEn:'You now have five body-measurement points, so the charts are starting to tell a story.'},
  {id:'body_10',group:'body',threshold:10,icon:'📏',ru:'10 Body Check-ins',en:'10 Body Check-ins',detailRu:'Десять замеров — достаточно, чтобы смотреть на направление, а не на случайные колебания.',detailEn:'Ten check-ins make it easier to focus on direction rather than random fluctuations.'}
];

let currentMotivation=null;

function motivationEnglishTotalAll(){
  let total=0;
  for(const date of Object.keys(data.logs||{})){
    const row=data.logs[date]||{};
    const detailed=(Number(row.english_chatgpt)||0)+(Number(row.english_native)||0)+(Number(row.english_russian)||0)+(Number(row.english_watching)||0);
    total+=detailed || (Number(row.english_general)||0);
  }
  return total;
}

function motivationGymTotal(){
  return Object.values(data.logs||{}).filter(row=>row&&row.gym===true).length;
}

function motivationLoggedCount(id){
  return Object.values(data.logs||{}).filter(row=>{
    const v=row?.[id];
    return v!==undefined&&v!==null&&v!==''&&Number(v)>0;
  }).length;
}

function motivationLongestGoalStreak(id,goal){
  goal=Number(goal||0);
  if(!goal)return 0;
  const keys=Object.keys(data.logs||{}).filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)).sort();
  if(!keys.length)return 0;
  const first=new Date(keys[0]+'T12:00:00');
  const last=new Date(keys[keys.length-1]+'T12:00:00');
  let best=0,current=0;
  for(let d=new Date(first);d<=last;d.setDate(d.getDate()+1)){
    const key=localDate(d);
    const v=Number(data.logs?.[key]?.[id]);
    if(Number.isFinite(v)&&v>=goal){current++;best=Math.max(best,current)}
    else current=0;
  }
  return best;
}

function motivationBodyCount(){
  return Object.values(data.bodyMeasurements||{}).filter(row=>row&&typeof row==='object'&&Object.values(row).some(v=>Number(v)>0)).length;
}

function motivationGroupValue(group){
  if(group==='smoke')return data.smokeDate?daysSince(data.smokeDate):0;
  if(group==='alcohol')return alcoholCurrentStreakDays();
  if(group==='english')return motivationEnglishTotalAll();
  if(group==='gym')return motivationGymTotal();
  if(group==='protein')return motivationLongestGoalStreak('protein',data.proteinGoal);
  if(group==='steps')return motivationLongestGoalStreak('steps',data.stepsGoal);
  if(group==='sleep')return motivationLoggedCount('sleep');
  if(group==='body')return motivationBodyCount();
  return 0;
}

function motivationHighestUnseen(){
  const seen=data.motivationSeen||{};
  const groupOrder=['smoke','alcohol','body','english','gym','protein','steps','sleep'];
  for(const group of groupOrder){
    const value=motivationGroupValue(group);
    const reached=MOTIVATION_MILESTONES
      .filter(m=>m.group===group&&value>=m.threshold&&!seen[m.id])
      .sort((a,b)=>b.threshold-a.threshold);
    if(reached.length){
      const m={...reached[0]};
      m.kind=m.medical?'medical':'milestone';
      m.groupValue=value;
      return m;
    }
  }
  return null;
}

function motivationPersonal(){
  const options=[];

  const alcohol=alcoholCurrentStreakDays();
  if(alcohol>=2)options.push({
    kind:'personal',icon:'🍷',
    ru:`${alcohol} дней без алкоголя`,
    en:`${alcohol} days alcohol-free`,
    detailRu:'Текущая серия продолжается. Каждый новый день автоматически добавляется в календарь как день без алкоголя, если ты не отметил обратное.',
    detailEn:'Your current streak continues. Each new day is automatically treated as alcohol-free unless you mark otherwise.'
  });

  const smoke=data.smokeDate?daysSince(data.smokeDate):0;
  if(smoke>=30)options.push({
    kind:'personal',icon:'🚭',
    ru:`${smoke} дней без сигарет`,
    en:`${smoke} days smoke-free`,
    detailRu:'Это твоя текущая непрерывная серия без сигарет.',
    detailEn:'This is your current continuous smoke-free streak.'
  });

  const eng7=englishTotalN(7);
  if(eng7>0)options.push({
    kind:'personal',icon:'🇬🇧',
    ru:`English: ${Math.round(eng7/60*10)/10} ч за 7 дней`,
    en:`English: ${Math.round(eng7/60*10)/10} h in 7 days`,
    detailRu:`За последние 7 дней записано ${Math.round(eng7)} минут английского.`,
    detailEn:`You logged ${Math.round(eng7)} minutes of English in the last 7 days.`
  });

  const firstWaist=bodyFirst('waist'),latestWaist=bodyLatest('waist');
  if(firstWaist&&latestWaist&&firstWaist.date!==latestWaist.date){
    const diff=Math.round((latestWaist.value-firstWaist.value)*10)/10;
    options.push({
      kind:'personal',icon:'📏',
      ru:`Талия: ${bodyFormatDelta(diff,'см')} с первого замера`,
      en:`Waist: ${bodyFormatDelta(diff,'cm')} from your first check-in`,
      detailRu:`Первый замер: ${bodyFormatNumber(firstWaist.value)} см. Последний: ${bodyFormatNumber(latestWaist.value)} см.`,
      detailEn:`First measurement: ${bodyFormatNumber(firstWaist.value)} cm. Latest: ${bodyFormatNumber(latestWaist.value)} cm.`
    });
  }

  const sleepRows=dates(7).map(d=>Number(data.logs?.[d]?.sleep)).filter(v=>Number.isFinite(v)&&v>0);
  if(sleepRows.length>=4){
    const avg=sleepRows.reduce((a,b)=>a+b,0)/sleepRows.length;
    options.push({
      kind:'personal',icon:'😴',
      ru:`Средний сон: ${Math.round(avg*10)/10} ч`,
      en:`Average sleep: ${Math.round(avg*10)/10} h`,
      detailRu:`Среднее по ${sleepRows.length} заполненным ночам за последние 7 дней.`,
      detailEn:`Average across ${sleepRows.length} logged nights in the last 7 days.`
    });
  }

  if(!options.length)return null;
  const seed=motivationHash(localDate()+'personal');
  return options[seed%options.length];
}

function motivationHash(str){
  let h=2166136261;
  for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}
  return Math.abs(h>>>0);
}

function motivationGeneric(){
  const g=MOTIVATION_GENERIC[motivationHash(localDate())%MOTIVATION_GENERIC.length];
  return {
    kind:'generic',icon:'🌱',
    ru:g.ru,en:g.en,
    detailRu:g.ru,detailEn:g.en
  };
}

function getMotivation(){
  return motivationHighestUnseen() || motivationPersonal() || motivationGeneric();
}

function motivationTitle(m){
  return (data.language||'ru')==='en'?m.en:m.ru;
}
function motivationDetail(m){
  return (data.language||'ru')==='en'?(m.detailEn||m.en):(m.detailRu||m.ru);
}
function motivationKicker(m){
  if(m.kind==='medical')return trText('Медицинский milestone','Medical milestone');
  if(m.kind==='milestone')return trText('Новый milestone','New milestone');
  if(m.kind==='personal')return trText('Твой прогресс','Your progress');
  return '';
}
function motivationSub(m){
  if(m.kind==='medical')return trText('Нажми, чтобы узнать больше','Tap to learn more');
  if(m.kind==='milestone')return trText('Достижение · My Rhythm','Achievement · My Rhythm');
  if(m.kind==='personal')return trText('Персональный прогресс · My Rhythm','Personal progress · My Rhythm');
  return 'My Rhythm';
}

function renderMotivationCard(){
  const card=document.getElementById('motivationCard');
  if(!card)return;

  currentMotivation=getMotivation();
  const m=currentMotivation;

  card.classList.remove('milestone','medical','personal','generic');
  card.classList.add(m.kind);

  const icon=document.getElementById('motivationIcon');
  const kicker=document.getElementById('motivationKicker');
  const text=document.getElementById('motivationText');
  const sub=document.getElementById('motivationSub');

  if(icon)icon.textContent=m.icon||'✨';
  if(kicker)kicker.textContent=motivationKicker(m);

  if(text){
    if(m.kind==='medical'){
      text.innerHTML=`<span class="motivation-card-title">${motivationTitle(m)}</span><span class="motivation-card-fact">${motivationDetail(m)}</span>`;
    }else if(m.kind==='milestone'){
      text.innerHTML=`<span class="motivation-card-title">${motivationTitle(m)}</span><span class="motivation-card-fact">${motivationDetail(m)}</span>`;
    }else{
      text.textContent=motivationTitle(m);
    }
  }

  if(sub)sub.textContent=motivationSub(m);
}

function openMotivationDetail(){
  const m=currentMotivation||getMotivation();
  currentMotivation=m;

  const set=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=val};
  set('motivationDetailIcon',m.icon||'✨');
  set('motivationDetailKicker',motivationKicker(m)||trText('My Rhythm','My Rhythm'));
  set('motivationDetailTitle',motivationTitle(m));
  set('motivationDetailText',motivationDetail(m));
  set('motivationSourceLabel',trText('Источник','Source'));

  const sourceBox=document.getElementById('motivationSourceBox');
  const sourceName=document.getElementById('motivationSourceName');
  const sourceBtn=document.getElementById('motivationSourceBtn');
  const src=m.source?MOTIVATION_SOURCES[m.source]:null;

  if(sourceBox)sourceBox.style.display=src?'block':'none';
  if(src&&sourceName)sourceName.textContent=src.name;
  if(src&&sourceBtn){
    sourceBtn.textContent=trText('Открыть источник ↗','Open source ↗');
    sourceBtn.onclick=()=>window.open(src.url,'_blank','noopener');
  }

  const ack=document.getElementById('motivationAckBtn');
  if(ack)ack.textContent=(m.kind==='milestone'||m.kind==='medical')
    ?trText('Понятно','Got it')
    :trText('Закрыть','Close');

  document.getElementById('motivationModal')?.classList.add('show');
}

function closeMotivationDetail(){
  document.getElementById('motivationModal')?.classList.remove('show');
}

function acknowledgeMotivation(){
  const m=currentMotivation;
  if(m&&(m.kind==='milestone'||m.kind==='medical')&&m.group){
    if(!data.motivationSeen||typeof data.motivationSeen!=='object')data.motivationSeen={};
    const currentValue=motivationGroupValue(m.group);
    for(const item of MOTIVATION_MILESTONES){
      if(item.group===m.group&&item.threshold<=currentValue)data.motivationSeen[item.id]=new Date().toISOString();
    }
    persistData({renderAfter:true,makeSnapshot:true});
  }
  closeMotivationDetail();
}

function renderToday(){renderTodayPage()}
function renderEnglish(){
  const setText=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value};
  setText('englishPageSubtitle',trText('Учи, повторяй и превращай знания в активный английский.','Learn, review and turn knowledge into active English.'));
  setText('englishReviewLabel',trText('Повторить сегодня','Today to review'));
  setText('englishStartReviewText',trText('Начать повторение','Start review'));
  setText('englishTodayLabel',trText('Сегодня','Today'));
  setText('englishSessionTitle',trText('Время учёбы за день','Daily study totals'));
  setText('englishSessionHint',trText('Укажи общее время за сегодня для выбранного занятия.','Enter today’s total for the selected activity.'));

  const planCompleted=englishPlanCompletedCount();
  const planTotal=ENGLISH_WEEK_PLAN.sessions.length;
  const planTitle=(data.language||'ru')==='en'?ENGLISH_WEEK_PLAN.title.en:ENGLISH_WEEK_PLAN.title.ru;
  setText('englishPlanKicker',trText('B2 · Неделя 1','B2 · Week 1'));
  setText('englishPlanDashboardTitle',planTitle);
  setText('englishPlanDashboardMeta',`${planTotal} ${trText('урока','lessons')} · ${ENGLISH_WEEK_PLAN.totalMinutes} ${trText('мин','min')}`);
  setText('englishPlanDashboardCompleted',`${planCompleted} / ${planTotal}`);
  setText('englishPlanDashboardCompletedLabel',trText('завершено','completed'));
  const planBar=document.getElementById('englishPlanDashboardBar');
  if(planBar)planBar.style.width=`${Math.round(planCompleted/planTotal*100)}%`;

  const todayMinutes=Math.round(englishTodayN());
  const weekMinutes=Math.round(weeklyWindow().currentKeys.reduce((total,date)=>total+englishMinutesForDate(date),0));
  setText('engToday',`${todayMinutes} ${trText('мин','min')}`);
  setText('engWeek',weekMinutes);
  setText('engWeekGoal',`/ ${data.englishGoal} ${trText('мин','min')}`);

  const items=englishAllItems();
  const reviewed=englishReviewedCount();
  const coverage=items.length?Math.round(reviewed/items.length*100):0;
  setText('englishCoverageValue',`${reviewed} / ${items.length}`);
  setText('englishCoverageLabel',trText('повторено','reviewed'));
  setText('englishCoverageNote',trText('Это покрытие повторением, а не оценка уровня английского.','This is review coverage, not an English-level score.'));
  const coverageBar=document.getElementById('englishCoverageBar');
  if(coverageBar)coverageBar.style.width=`${coverage}%`;

  const counts=englishReviewCounts();
  setText(
    'englishReviewCounts',
    `${counts.words} ${trText('слов/фраз','words')} · ${counts.grammar} ${trText('правил','rules')} · ${counts.mistakes} ${trText('ошибок','mistakes')}${counts.newCount?` · ${counts.newCount} ${trText('новых','new')}`:''}`
  );
  setText('englishWordsCount',englishItemsByKind('words').length);
  setText('englishWordsDue',`${counts.words} ${trText('к повторению','due')}`);
  setText('englishGrammarCount',englishItemsByKind('grammar').length);
  setText('englishGrammarDue',`${counts.grammar} ${trText('к повторению','due')}`);
  setText('englishMistakesCount',englishItemsByKind('mistakes').length);
  setText('englishMistakesDue',`${counts.mistakes} ${trText('к повторению','due')}`);
  setText('englishQueueDue',`${counts.total} ${trText('элементов к повторению','items due')}`);

  const strip=document.getElementById('englishWeekStrip');
  if(strip){
    const week=englishWeekData();
    const max=Math.max(1,...week.map(x=>x.value));
    strip.innerHTML=week.map(x=>{
      const h=x.value?Math.max(4,Math.round(x.value/max*38)):3;
      return `<div class="english-week-day"><div class="english-week-bar" style="height:${h}px;opacity:${x.value?1:.18}"></div><span>${englishWeekdayShort(x.date)}</span></div>`;
    }).join('');
  }

  const focus=document.getElementById('englishFocusList');
  if(focus){
    focus.innerHTML=ENGLISH_FOCUS_IDS.map(id=>{
      const item=englishItemById(id);
      if(!item)return '';
      const state=englishReviewState(id);
      const status=englishIsDue(item)
        ?trText('Практика','Practice')
        :(state?.nextReview?bodyFriendlyDate(state.nextReview,true):trText('Повторить','Review'));
      return `<button class="english-focus-row" onclick="englishLearningParent='grammar';openEnglishItem('${id}','grammar');document.getElementById('englishLearningModal')?.classList.add('show');document.body.style.overflow='hidden'"><span>${escapeHTML(englishCompactTitle(item))}</span><span class="english-focus-tag">${status}</span></button>`;
    }).join('');
  }
}
// V6.7_WEEKLY_REVIEW_START
function weeklyWindow(todayKey=localDate()){
  const start=weeklyMonday(todayKey);
  const end=weeklyAddDays(start,6);
  const elapsed=Math.max(1,Math.min(7,weeklyDiffDays(start,todayKey)+1));
  const currentKeys=weeklyKeys(start,elapsed);
  const prevStart=weeklyAddDays(start,-7);
  const prevKeys=weeklyKeys(prevStart,elapsed);
  return {todayKey,start,end,elapsed,currentKeys,prevStart,prevKeys,complete:elapsed===7};
}
function weeklyHasOwn(row,key){
  return !!row && Object.prototype.hasOwnProperty.call(row,key) && row[key]!=='' && row[key]!==null && row[key]!==undefined;
}
function weeklyNumericStats(id,keys,{positiveOnly=false,goal=null}={}){
  const values=[];
  let goalDays=0;
  for(const key of keys){
    const row=data.logs?.[key];
    if(!weeklyHasOwn(row,id)||typeof row[id]==='boolean')continue;
    const n=Number(row[id]);
    if(!Number.isFinite(n))continue;
    if(positiveOnly ? n<=0 : n<0)continue;
    values.push({date:key,value:n});
    if(goal!==null && Number(goal)>0 && n>=Number(goal))goalDays++;
  }
  const avg=values.length?values.reduce((s,x)=>s+x.value,0)/values.length:null;
  const total=values.reduce((s,x)=>s+x.value,0);
  return {values,count:values.length,avg,total,goalDays};
}
function weeklyEnglishForDay(dateKey){return englishMinutesForDate(dateKey)}
function weeklyEnglishStats(keys){
  const rows=keys.map(date=>({date,value:weeklyEnglishForDay(date)})).filter(x=>x.value>0);
  return {
    rows,
    count:rows.length,
    total:rows.reduce((s,x)=>s+x.value,0)
  };
}
function weeklyGymStats(keys){
  const sessions=keys.filter(k=>data.logs?.[k]?.gym===true).length;
  return {sessions};
}
function weeklyWeightStats(keys){
  const all=Object.keys(data.logs||{}).sort();
  const current=all
    .filter(k=>keys.includes(k))
    .map(k=>({date:k,value:Number(data.logs?.[k]?.weight)}))
    .filter(x=>Number.isFinite(x.value)&&x.value>0)
    .pop()||null;

  const latestOverall=[...all].reverse()
    .map(k=>({date:k,value:Number(data.logs?.[k]?.weight)}))
    .find(x=>Number.isFinite(x.value)&&x.value>0)||null;

  let previous=null;
  if(current){
    previous=[...all].reverse()
      .filter(k=>k<current.date)
      .map(k=>({date:k,value:Number(data.logs?.[k]?.weight)}))
      .find(x=>Number.isFinite(x.value)&&x.value>0)||null;
  }
  const delta=current&&previous?Math.round((current.value-previous.value)*10)/10:null;
  return {current,previous,latestOverall,delta};
}
function weeklyBodyChange(keys){
  const store=data.bodyMeasurements||{};
  const currentDate=Object.keys(store)
    .filter(k=>keys.includes(k) && store[k] && typeof store[k]==='object')
    .sort()
    .pop();
  if(!currentDate)return null;

  const preference=['waist','abdomen','chest','hips','thigh'];
  const labels={
    waist:{ru:'Талия',en:'Waist'},
    abdomen:{ru:'Живот',en:'Abdomen'},
    chest:{ru:'Грудь',en:'Chest'},
    hips:{ru:'Бёдра',en:'Hips'},
    thigh:{ru:'Бедро',en:'Thigh'}
  };

  let metric='';
  for(const id of preference){
    const v=Number(store[currentDate]?.[id]);
    if(Number.isFinite(v)&&v>0){metric=id;break}
  }
  if(!metric)return null;

  const value=Number(store[currentDate][metric]);
  const prevDate=Object.keys(store)
    .filter(k=>k<currentDate && Number(store[k]?.[metric])>0)
    .sort()
    .pop()||'';
  const prevValue=prevDate?Number(store[prevDate][metric]):null;
  const delta=prevDate?Math.round((value-prevValue)*10)/10:null;

  return {
    metric,
    label:(data.language||'ru')==='en'?labels[metric].en:labels[metric].ru,
    date:currentDate,
    value,
    prevDate,
    prevValue,
    delta
  };
}
function weeklyAlcoholStats(keys){
  const start=alcoholTrackingStart();
  const today=localDate();
  const tracked=keys.filter(k=>k>=start && k<=today);
  const drink=tracked.filter(k=>alcoholIsDrink(k)).length;
  return {tracked:tracked.length,drink,free:Math.max(0,tracked.length-drink)};
}
function weeklyBuildSummary(todayKey=localDate()){
  const window=weeklyWindow(todayKey);
  const sleep=weeklyNumericStats('sleep',window.currentKeys,{positiveOnly:true,goal:data.sleepGoal});
  const prevSleep=weeklyNumericStats('sleep',window.prevKeys,{positiveOnly:true,goal:data.sleepGoal});
  const steps=weeklyNumericStats('steps',window.currentKeys,{goal:data.stepsGoal});
  const prevSteps=weeklyNumericStats('steps',window.prevKeys,{goal:data.stepsGoal});
  const protein=weeklyNumericStats('protein',window.currentKeys,{goal:data.proteinGoal});
  const prevProtein=weeklyNumericStats('protein',window.prevKeys,{goal:data.proteinGoal});
  const outdoors=weeklyNumericStats('outdoors',window.currentKeys,{goal:data.outdoorsGoal});
  const prevOutdoors=weeklyNumericStats('outdoors',window.prevKeys,{goal:data.outdoorsGoal});
  const english=weeklyEnglishStats(window.currentKeys);
  const prevEnglish=weeklyEnglishStats(window.prevKeys);
  const gym=weeklyGymStats(window.currentKeys);
  const prevGym=weeklyGymStats(window.prevKeys);
  const weight=weeklyWeightStats(window.currentKeys);
  const alcohol=weeklyAlcoholStats(window.currentKeys);
  const body=weeklyBodyChange(window.currentKeys);

  return {
    window,
    sleep,prevSleep,
    steps,prevSteps,
    protein,prevProtein,
    outdoors,prevOutdoors,
    english,prevEnglish,
    gym,prevGym,
    weight,alcohol,body
  };
}
function weeklyRound(v,digits=1){
  if(v===null||v===undefined||!Number.isFinite(Number(v)))return null;
  const p=10**digits;
  return Math.round(Number(v)*p)/p;
}
function weeklySigned(v,suffix=''){
  if(v===null||v===undefined||!Number.isFinite(Number(v)))return '—';
  const n=weeklyRound(v,1);
  if(n===0)return `0${suffix}`;
  return `${n>0?'+':'−'}${Math.abs(n)}${suffix}`;
}
function weeklyPctChange(current,previous){
  if(current===null||current===undefined||previous===null||previous===undefined||!Number(previous))return null;
  return Math.round((Number(current)-Number(previous))/Math.abs(Number(previous))*100);
}
function weeklyFormatMinutes(mins){
  mins=Math.max(0,Math.round(Number(mins)||0));
  const h=Math.floor(mins/60),m=mins%60;
  if(h&&m)return `${h}${trText('ч','h')} ${m}${trText('м','m')}`;
  if(h)return `${h}${trText('ч','h')}`;
  return `${m}${trText('м','m')}`;
}
function weeklyFormatDate(dateKey){
  if(!dateKey)return '—';
  const locale=(data.language||'ru')==='en'?'en-NZ':'ru-RU';
  return weeklyParseDate(dateKey).toLocaleDateString(locale,{day:'numeric',month:'short'});
}
function weeklyPeriodLabel(start,end){
  const locale=(data.language||'ru')==='en'?'en-NZ':'ru-RU';
  const a=weeklyParseDate(start),b=weeklyParseDate(end);
  if(a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth()){
    return `${a.getDate()}–${b.toLocaleDateString(locale,{day:'numeric',month:'short'})}`;
  }
  return `${a.toLocaleDateString(locale,{day:'numeric',month:'short'})} – ${b.toLocaleDateString(locale,{day:'numeric',month:'short'})}`;
}
function weeklyCompareDelta(current,previous,kind='number'){
  if(current===null||current===undefined||previous===null||previous===undefined)return null;
  if(kind==='pct')return weeklyPctChange(current,previous);
  return weeklyRound(Number(current)-Number(previous),1);
}
function weeklyCoverageScore(count,elapsed){
  if(!elapsed)return 0;
  return Math.max(0,Math.min(1,Number(count||0)/elapsed));
}
function weeklyStrongest(summary){
  const e=summary.window.elapsed;
  const candidates=[];

  if(summary.sleep.count){
    const closeness=Math.max(0,1-Math.abs(summary.sleep.avg-data.sleepGoal)/Math.max(1,data.sleepGoal));
    candidates.push({
      id:'sleep',
      score:closeness*weeklyCoverageScore(summary.sleep.count,e),
      title:trText('Сон ближе всего к твоей цели.','Sleep is closest to your target.'),
      meta:`${weeklyRound(summary.sleep.avg,1)} ${trText('ч в среднем','h avg')} · ${summary.sleep.count}/${e} ${trText('ночей записано','nights logged')}`
    });
  }
  for(const [id,stats,goal,label] of [
    ['steps',summary.steps,data.stepsGoal,trText('Шаги — самая сильная привычка недели.','Steps are your strongest habit this week.')],
    ['protein',summary.protein,data.proteinGoal,trText('Белок — самая сильная привычка недели.','Protein is your strongest habit this week.')],
    ['outdoors',summary.outdoors,data.outdoorsGoal,trText('Время на улице — самая сильная привычка недели.','Time outdoors is your strongest habit this week.')]
  ]){
    if(stats.count && Number(goal)>0){
      const avgScore=Math.min(1,stats.avg/goal);
      candidates.push({
        id,
        score:avgScore*weeklyCoverageScore(stats.count,e),
        title:label,
        meta:`${stats.goalDays}/${e} ${trText('дней на цели','days at goal')} · ${stats.count}/${e} ${trText('записано','logged')}`
      });
    }
  }

  if(Number(data.englishGoal)>0){
    const expected=data.englishGoal*(e/7);
    if(summary.english.total>0){
      candidates.push({
        id:'english',
        score:Math.min(1,summary.english.total/Math.max(1,expected)),
        title:trText('English идёт сильнее всего относительно темпа недели.','English is strongest relative to this week’s pace.'),
        meta:`${weeklyFormatMinutes(summary.english.total)} · ${trText('цель','goal')} ${weeklyFormatMinutes(data.englishGoal)}`
      });
    }
  }

  if(Number(data.gymGoal)>0 && summary.gym.sessions>0){
    const expected=data.gymGoal*(e/7);
    candidates.push({
      id:'gym',
      score:Math.min(1,summary.gym.sessions/Math.max(.25,expected)),
      title:trText('Тренировки идут сильнее всего относительно темпа недели.','Workouts are strongest relative to this week’s pace.'),
      meta:`${summary.gym.sessions}/${data.gymGoal} ${trText('тренировок за неделю','workouts this week')}`
    });
  }

  if(!candidates.length){
    return {
      id:'none',
      title:trText('Пока мало данных для выбора сильной стороны.','Not enough data yet to identify a strongest area.'),
      meta:trText('Продолжай заполнять текущую неделю.','Keep logging the current week.')
    };
  }
  candidates.sort((a,b)=>b.score-a.score);
  return candidates[0];
}
function weeklyChanged(summary){
  const c=[];
  const add=(id,score,title,meta)=>{if(Number.isFinite(score))c.push({id,score:Math.abs(score),title,meta})};

  if(summary.sleep.count && summary.prevSleep.count){
    const d=weeklyRound(summary.sleep.avg-summary.prevSleep.avg,1);
    add(
      'sleep',
      d/Math.max(1,data.sleepGoal),
      `${trText('Сон','Sleep')} ${weeklySigned(d,trText(' ч',' h'))}`,
      `${weeklyRound(summary.sleep.avg,1)} ${trText('ч','h')} vs ${weeklyRound(summary.prevSleep.avg,1)} ${trText('ч за те же дни прошлой недели','h for the same days last week')}`
    );
  }

  for(const [id,stats,prev,label,unit] of [
    ['steps',summary.steps,summary.prevSteps,trText('Шаги','Steps'),''],
    ['protein',summary.protein,summary.prevProtein,trText('Белок','Protein'),trText(' г',' g')],
    ['outdoors',summary.outdoors,summary.prevOutdoors,trText('Улица','Outdoors'),trText(' мин',' min')]
  ]){
    if(stats.count && prev.count && Number(prev.avg)!==0){
      const pct=weeklyPctChange(stats.avg,prev.avg);
      add(
        id,
        pct/100,
        `${label} ${weeklySigned(pct,'%')}`,
        `${weeklyRound(stats.avg,1)}${unit} ${trText('в среднем vs','avg vs')} ${weeklyRound(prev.avg,1)}${unit}`
      );
    }
  }

  if(summary.english.total>0 && summary.prevEnglish.total>0){
    const pct=weeklyPctChange(summary.english.total,summary.prevEnglish.total);
    add(
      'english',
      pct/100,
      `English ${weeklySigned(pct,'%')}`,
      `${weeklyFormatMinutes(summary.english.total)} vs ${weeklyFormatMinutes(summary.prevEnglish.total)} ${trText('за те же дни прошлой недели','for the same days last week')}`
    );
  }

  if(summary.gym.sessions!==summary.prevGym.sessions){
    const diff=summary.gym.sessions-summary.prevGym.sessions;
    add(
      'gym',
      diff/Math.max(1,data.gymGoal),
      `${trText('Тренировки','Workouts')} ${weeklySigned(diff)}`,
      `${summary.gym.sessions} vs ${summary.prevGym.sessions} ${trText('за те же дни прошлой недели','for the same days last week')}`
    );
  }

  if(summary.weight.current && summary.weight.previous && summary.weight.delta!==null){
    add(
      'weight',
      summary.weight.delta/Math.max(1,summary.weight.previous.value),
      `${trText('Вес','Weight')} ${weeklySigned(summary.weight.delta,trText(' кг',' kg'))}`,
      trText('Изменение с предыдущего взвешивания. Без оценки «лучше/хуже».','Change since the previous weigh-in. No “better/worse” judgement.')
    );
  }

  if(summary.body && summary.body.delta!==null){
    add(
      'body',
      summary.body.delta/Math.max(1,summary.body.prevValue||1),
      `${summary.body.label} ${weeklySigned(summary.body.delta,trText(' см',' cm'))}`,
      trText('Изменение относительно предыдущего Body Check-in.','Change vs the previous Body Check-in.')
    );
  }

  if(!c.length){
    return {
      id:'none',
      title:trText('Пока недостаточно сравнимых данных.','Not enough comparable data yet.'),
      meta:trText('Сравнение появится, когда будут данные за те же дни прошлой недели.','Comparison appears when the same weekdays from last week have data.')
    };
  }
  c.sort((a,b)=>b.score-a.score);
  return c[0];
}
function weeklyFocus(summary){
  const e=summary.window.elapsed;

  if(e<=2){
    return {
      id:'early',
      title:trText('Неделя только началась — не меняй курс слишком рано.','The week has just started — don’t change course too early.'),
      meta:trText('Соберём ещё несколько дней данных и выберем один фокус.','Collect a few more days of data, then we’ll choose one focus.')
    };
  }

  const candidates=[];
  const add=(id,score,title,meta)=>candidates.push({id,score,title,meta});

  if(summary.steps.count){
    add(
      'steps',
      Math.min(1,summary.steps.avg/Math.max(1,data.stepsGoal)),
      trText('Подтянуть шаги.','Bring steps closer to target.'),
      `${trText('Среднее','Average')}: ${Math.round(summary.steps.avg)} · ${trText('цель','goal')}: ${Math.round(data.stepsGoal)}`
    );
  }
  if(summary.protein.count){
    add(
      'protein',
      Math.min(1,summary.protein.avg/Math.max(1,data.proteinGoal)),
      trText('Подтянуть белок.','Bring protein closer to target.'),
      `${trText('Среднее','Average')}: ${weeklyRound(summary.protein.avg,1)} ${trText('г','g')} · ${trText('цель','goal')}: ${data.proteinGoal} ${trText('г','g')}`
    );
  }
  if(summary.outdoors.count){
    add(
      'outdoors',
      Math.min(1,summary.outdoors.avg/Math.max(1,data.outdoorsGoal)),
      trText('Добавить времени на улице.','Add more time outdoors.'),
      `${trText('Среднее','Average')}: ${weeklyRound(summary.outdoors.avg,1)} ${trText('мин','min')} · ${trText('цель','goal')}: ${data.outdoorsGoal}`
    );
  }
  if(summary.sleep.count>=2 && summary.sleep.avg<data.sleepGoal){
    add(
      'sleep',
      Math.min(1,summary.sleep.avg/Math.max(1,data.sleepGoal)),
      trText('Сон ниже твоей цели.','Sleep is below your target.'),
      `${weeklyRound(summary.sleep.avg,1)} ${trText('ч в среднем','h avg')} · ${trText('цель','goal')}: ${data.sleepGoal} ${trText('ч','h')}`
    );
  }

  if(Number(data.englishGoal)>0){
    const expected=data.englishGoal*(e/7);
    add(
      'english',
      Math.min(1,summary.english.total/Math.max(1,expected)),
      trText('Подтянуть English до темпа недельной цели.','Bring English closer to the weekly-goal pace.'),
      `${weeklyFormatMinutes(summary.english.total)} · ${trText('ожидаемый темп к этому дню','expected pace by now')}: ${weeklyFormatMinutes(expected)}`
    );
  }

  if(Number(data.gymGoal)>0){
    const expected=data.gymGoal*(e/7);
    add(
      'gym',
      Math.min(1,summary.gym.sessions/Math.max(.25,expected)),
      trText('Вернуться к темпу тренировок.','Get back to your workout pace.'),
      `${summary.gym.sessions} ${trText('сессий','sessions')} · ${trText('недельная цель','weekly goal')}: ${data.gymGoal}`
    );
  }

  if(!candidates.length){
    return {
      id:'none',
      title:trText('Пока нет явного фокуса.','There is no clear focus yet.'),
      meta:trText('Продолжай обычный ритм и заполняй данные.','Keep your normal rhythm and continue logging.')
    };
  }

  candidates.sort((a,b)=>a.score-b.score);
  const worst=candidates[0];

  if(worst.score>=.90){
    return {
      id:'ontrack',
      title:trText('Явного слабого места нет — сохрани текущий ритм.','No clear weak spot — protect your current rhythm.'),
      meta:trText('Основные показатели близки к своим целям.','The main metrics are close to their targets.')
    };
  }
  return worst;
}
function weeklyMetricCards(summary){
  const e=summary.window.elapsed;
  const sameWeek=trText('vs те же дни прошлой недели','vs same days last week');

  const sleepDelta=summary.sleep.count&&summary.prevSleep.count
    ? weeklyRound(summary.sleep.avg-summary.prevSleep.avg,1):null;
  const stepsPct=summary.steps.count&&summary.prevSteps.count
    ? weeklyPctChange(summary.steps.avg,summary.prevSteps.avg):null;
  const proteinPct=summary.protein.count&&summary.prevProtein.count
    ? weeklyPctChange(summary.protein.avg,summary.prevProtein.avg):null;
  const outdoorsPct=summary.outdoors.count&&summary.prevOutdoors.count
    ? weeklyPctChange(summary.outdoors.avg,summary.prevOutdoors.avg):null;
  const englishPct=summary.english.total&&summary.prevEnglish.total
    ? weeklyPctChange(summary.english.total,summary.prevEnglish.total):null;
  const gymDiff=summary.gym.sessions-summary.prevGym.sessions;

  return [
    {
      id:'sleep',icon:'😴',name:trText('Сон','Sleep'),
      value:summary.sleep.count?`${weeklyRound(summary.sleep.avg,1)} ${trText('ч avg','h avg')}`:'—',
      meta:summary.sleep.count
        ?`${summary.sleep.count}/${e} ${trText('ночей записано','nights logged')} · ${trText('цель','goal')} ${data.sleepGoal}${trText('ч','h')}`
        :trText('Нет записей сна на этой неделе.','No sleep logged this week.'),
      delta:sleepDelta===null?'':`${weeklySigned(sleepDelta,trText(' ч',' h'))} ${sameWeek}`
    },
    {
      id:'steps',icon:'🚶',name:trText('Шаги','Steps'),
      value:summary.steps.count?`${Math.round(summary.steps.avg).toLocaleString((data.language||'ru')==='en'?'en-NZ':'ru-RU')} avg`:'—',
      meta:summary.steps.count
        ?`${summary.steps.goalDays}/${e} ${trText('дней на цели','days at goal')} · ${summary.steps.count}/${e} ${trText('записано','logged')}`
        :trText('Нет записей шагов на этой неделе.','No steps logged this week.'),
      delta:stepsPct===null?'':`${weeklySigned(stepsPct,'%')} ${sameWeek}`
    },
    {
      id:'protein',icon:'🥩',name:trText('Белок','Protein'),
      value:summary.protein.count?`${weeklyRound(summary.protein.avg,1)} ${trText('г avg','g avg')}`:'—',
      meta:summary.protein.count
        ?`${summary.protein.goalDays}/${e} ${trText('дней на цели','days at goal')} · ${summary.protein.count}/${e} ${trText('записано','logged')}`
        :trText('Нет записей белка на этой неделе.','No protein logged this week.'),
      delta:proteinPct===null?'':`${weeklySigned(proteinPct,'%')} ${sameWeek}`
    },
    {
      id:'outdoors',icon:'☀️',name:trText('Улица','Outdoors'),
      value:summary.outdoors.count?`${weeklyRound(summary.outdoors.avg,1)} ${trText('мин avg','min avg')}`:'—',
      meta:summary.outdoors.count
        ?`${summary.outdoors.goalDays}/${e} ${trText('дней на цели','days at goal')} · ${summary.outdoors.count}/${e} ${trText('записано','logged')}`
        :trText('Нет записей улицы на этой неделе.','No outdoor time logged this week.'),
      delta:outdoorsPct===null?'':`${weeklySigned(outdoorsPct,'%')} ${sameWeek}`
    },
    {
      id:'gym',icon:'🏋️',name:trText('Тренировки','Workouts'),
      value:`${summary.gym.sessions} / ${data.gymGoal}`,
      meta:trText('сессий / недельная цель','sessions / weekly goal'),
      delta:gymDiff===0?'':`${weeklySigned(gymDiff)} ${trText('сессий','sessions')} ${sameWeek}`
    },
    {
      id:'english',icon:'🇬🇧',name:'English',
      value:weeklyFormatMinutes(summary.english.total),
      meta:`${Math.round(summary.english.total)} / ${Math.round(data.englishGoal)} ${trText('мин недельной цели','min weekly goal')}`,
      delta:englishPct===null?'':`${weeklySigned(englishPct,'%')} ${sameWeek}`
    },
    {
      id:'weight',icon:'⚖️',name:trText('Вес','Weight'),
      value:summary.weight.current?`${weeklyRound(summary.weight.current.value,1)} ${trText('кг','kg')}`:'—',
      meta:summary.weight.current
        ?`${weeklyFormatDate(summary.weight.current.date)} · ${trText('взвешивание этой недели','weigh-in this week')}`
        :(summary.weight.latestOverall
          ?`${trText('Последний','Latest')}: ${weeklyRound(summary.weight.latestOverall.value,1)} ${trText('кг','kg')} · ${weeklyFormatDate(summary.weight.latestOverall.date)}`
          :trText('Пока нет данных веса.','No weight data yet.')),
      delta:summary.weight.delta===null?'':`${weeklySigned(summary.weight.delta,trText(' кг',' kg'))} ${trText('с прошлого взвешивания','since previous weigh-in')}`,
      neutral:true
    },
    {
      id:'alcohol',icon:'🍷',name:trText('Без отметок об алкоголе','No alcohol marked'),
      value:summary.alcohol.tracked?`${summary.alcohol.free}/${summary.alcohol.tracked}`:'—',
      meta:summary.alcohol.tracked
        ?(summary.alcohol.drink
          ?`${summary.alcohol.drink} ${trText('дн. с алкоголем','drinking day(s)')}`
          :trText('по правилу календаря; не подтверждение трезвости','calendar assumption; not confirmed abstinence'))
        :trText('Эта неделя пока вне периода отслеживания.','This week is outside the tracking period.'),
      delta:''
    }
  ];
}
function renderWeeklyReview(){
  const grid=document.getElementById('weeklyMetricGrid');
  if(!grid)return;

  const summary=weeklyBuildSummary();
  const w=summary.window;
  const set=(id,value)=>{
    const el=document.getElementById(id);
    if(el)el.textContent=value;
  };

  set('weeklyReviewPeriod',weeklyPeriodLabel(w.start,w.end));
  set(
    'weeklyReviewScope',
    `${w.elapsed}/7 ${trText('дней недели прошло','days elapsed')} · ${trText('сравнение с теми же','compared with the same')} ${w.elapsed} ${trText('дн. прошлой недели','day(s) last week')}`
  );

  const status=document.getElementById('weeklyReviewStatus');
  if(status){
    status.textContent=w.complete?trText('Неделя завершена','Week complete'):trText('Неделя идёт','Week in progress');
    status.className='weekly-review-status'+(w.complete?' complete':'');
  }

  grid.innerHTML=weeklyMetricCards(summary).map(card=>`
    <div class="weekly-metric-card">
      <div class="weekly-metric-head"><span class="weekly-metric-icon">${card.icon}</span><span>${card.name}</span></div>
      <div class="weekly-metric-value">${card.value}</div>
      <div class="weekly-metric-meta">${card.meta}</div>
      ${card.delta?`<div class="weekly-metric-delta ${card.neutral?'neutral':''}">${card.delta}</div>`:''}
    </div>
  `).join('');

  const strongest=weeklyStrongest(summary);
  const changed=weeklyChanged(summary);
  const focus=weeklyFocus(summary);

  set('weeklyStrongestText',strongest.title);
  set('weeklyStrongestMeta',strongest.meta||'');
  set('weeklyChangedText',changed.title);
  set('weeklyChangedMeta',changed.meta||'');
  set('weeklyFocusText',focus.title);
  set('weeklyFocusMeta',focus.meta||'');
}
// V6.7_WEEKLY_REVIEW_END



// V6.7.4_SHARED_CHART_ENGINE_START
function sharedChartHTML(cfg){
  const {
    series,scale,formatY,formatX,periodLabel,
    selectedIndex=null,onSelectName,goal=null,
    connectAcrossMissing=false,bars=false,emptyText=''
  }=cfg;

  const recorded=series.filter(r=>r.value!==null&&r.value!==undefined);
  if(!bars&&recorded.length<2)return `<div class="trend-empty">${emptyText}</div>`;
  if(bars&&!series.length)return `<div class="trend-empty">${emptyText}</div>`;

  const W=1000,H=360,padT=15,padB=12;
  const n=Math.max(1,series.length-1);
  const x=index=>series.length<=1?W/2:W*(index/n);
  const min=scale.min,max=scale.max;
  const y=v=>padT+(H-padT-padB)*(1-(v-min)/(max-min));

  const grid=[0,.5,1].map(t=>{
    const yy=padT+(H-padT-padB)*t;
    return `<line class="trend-grid-line" x1="0" y1="${yy}" x2="${W}" y2="${yy}"></line>`;
  }).join('');

  const goalLine=(goal!==null&&goal!==undefined&&goal>=min&&goal<=max)
    ?`<line class="trend-goal-line" x1="0" y1="${y(goal)}" x2="${W}" y2="${y(goal)}"></line>`
    :'';

  let geometry='',hits='';

  if(bars){
    const base=y(Math.max(0,min));
    const barSpace=W/Math.max(1,series.length);
    const barW=Math.max(8,Math.min(60,barSpace*.56));

    geometry=series.map(r=>{
      if(r.value===null||r.value===undefined||r.value===0)return '';
      const xx=x(r.index)-barW/2,yy=y(r.value),hh=Math.max(3,base-yy);
      return `<rect class="trend-bar" x="${xx.toFixed(1)}" y="${yy.toFixed(1)}"
        width="${barW.toFixed(1)}" height="${hh.toFixed(1)}" rx="7"></rect>`;
    }).join('');

    hits=series.map(r=>{
      if(r.value===null||r.value===undefined||r.value===0)return '';
      const left=series.length<=1?50:(r.index/n)*100;
      const top=(y(r.value)/H)*100;
      const bottom=(1-y(Math.max(0,min))/H)*100;
      const height=Math.max(18,100-top-bottom);
      return `<button class="trend-bar-hit ${selectedIndex===r.index?'selected':''}"
        data-index="${r.index}" aria-label="${periodLabel(r)}"
        onclick="${onSelectName}(${r.index})"
        style="left:${left}%;top:${top}%;height:${height}%"></button>`;
    }).join('');
  }else{
    const segments=[];
    if(connectAcrossMissing){
      const all=series.filter(r=>r.value!==null&&r.value!==undefined)
        .map(r=>({...r,px:x(r.index),py:y(r.value)}));
      if(all.length)segments.push(all);
    }else{
      let current=[];
      for(const row of series){
        if(row.value===null||row.value===undefined){
          if(current.length){segments.push(current);current=[]}
          continue;
        }
        current.push({...row,px:x(row.index),py:y(row.value)});
      }
      if(current.length)segments.push(current);
    }

    const lines=[],areas=[];
    for(const segment of segments){
      if(segment.length<2)continue;
      const line=segment.map((p,i)=>(i?'L':'M')+p.px.toFixed(1)+','+p.py.toFixed(1)).join(' ');
      lines.push(`<path class="trend-line" d="${line}"></path>`);
      const area=`${line} L ${segment[segment.length-1].px.toFixed(1)},${y(min).toFixed(1)}
        L ${segment[0].px.toFixed(1)},${y(min).toFixed(1)} Z`;
      areas.push(`<path class="trend-area" d="${area}"></path>`);
    }
    geometry=areas.join('')+lines.join('');

    const pts=recorded.map((r,i)=>({
      ...r,
      px:series.length<=1?50:(r.index/n)*100,
      py:(y(r.value)/H)*100,
      latest:i===recorded.length-1
    }));
    hits=pts.map(p=>`<button
      class="trend-hit ${p.latest?'latest':''} ${selectedIndex===p.index?'selected':''}"
      data-index="${p.index}" aria-label="${periodLabel(p)} ${formatY(p.value)}"
      onclick="${onSelectName}(${p.index})"
      style="left:${p.px}%;top:${p.py}%"></button>`).join('');
  }

  const rawIndices=series.length>=7
    ?[0,Math.round((series.length-1)/3),Math.round((series.length-1)*2/3),series.length-1]
    :[0,Math.floor((series.length-1)/2),series.length-1];
  const idxs=rawIndices.filter((v,i,a)=>v>=0&&a.indexOf(v)===i);

  const xLabels=idxs.map((idx,pos)=>{
    const row=series[idx];
    return `<span class="trend-x-label ${pos===0?'first':(pos===idxs.length-1?'last':'')}"
      style="left:${series.length<=1?50:(idx/(series.length-1))*100}%">${formatX(row)}</span>`;
  }).join('');

  const yLabels=[max,(min+max)/2,min].map(v=>`<span>${formatY(v)}</span>`).join('');

  return `<div class="trend-chart-shell">
    <div class="trend-y-axis">${yLabels}</div>
    <div class="trend-plot">
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="trendLineGradient" x1="0" x2="1">
            <stop offset="0" stop-color="#2cdfa7"/>
            <stop offset="1" stop-color="#7770ff"/>
          </linearGradient>
          <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#2cdfa7" stop-opacity=".14"/>
            <stop offset="1" stop-color="#6b66ff" stop-opacity=".012"/>
          </linearGradient>
          <linearGradient id="trendBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#78ffda"/>
            <stop offset="1" stop-color="#6d68ff"/>
          </linearGradient>
        </defs>
        ${grid}${goalLine}${geometry}
      </svg>
      ${hits}
    </div>
    <div></div>
    <div class="trend-x-axis">${xLabels}</div>
  </div>`;
}
// V6.7.4_SHARED_CHART_ENGINE_END

// V6.7.3_TRENDS_START
const TREND_METRICS=[
  {id:'weight',icon:'⚖️',ru:'Вес',en:'Weight',unitRu:'кг',unitEn:'kg',kind:'line'},
  {id:'sleep',icon:'😴',ru:'Сон',en:'Sleep',unitRu:'ч',unitEn:'h',kind:'line'},
  {id:'steps',icon:'🚶',ru:'Шаги',en:'Steps',unitRu:'',unitEn:'',kind:'line'},
  {id:'protein',icon:'🥩',ru:'Белок',en:'Protein',unitRu:'г',unitEn:'g',kind:'line'},
  {id:'outdoors',icon:'☀️',ru:'Улица',en:'Outdoors',unitRu:'мин',unitEn:'min',kind:'line'},
  {id:'gym',icon:'🏋️',ru:'Тренировки',en:'Workouts',unitRu:'',unitEn:'',kind:'bars'},
  {id:'english',icon:'🇬🇧',ru:'English',en:'English',unitRu:'мин',unitEn:'min',kind:'line'}
];

let trendSelectedPoint=null;

function trendMetricDef(id){
  return TREND_METRICS.find(x=>x.id===id)||TREND_METRICS[0];
}
function trendMetricName(id){
  const m=trendMetricDef(id);
  return (data.language||'ru')==='en'?m.en:m.ru;
}
function trendMetricUnit(id){
  const m=trendMetricDef(id);
  return (data.language||'ru')==='en'?m.unitEn:m.unitRu;
}
function trendGoal(id){
  if(id==='sleep')return Number(data.sleepGoal)||null;
  if(id==='steps')return Number(data.stepsGoal)||null;
  if(id==='protein')return Number(data.proteinGoal)||null;
  if(id==='outdoors')return Number(data.outdoorsGoal)||null;
  return null;
}
function trendRangeKey(){
  if(trendRangeDays==='all')return 'all';
  if(Number(trendRangeDays)===365)return 'year';
  if(Number(trendRangeDays)===90)return 'quarter';
  if(Number(trendRangeDays)===30)return 'month';
  return 'week';
}
function trendGoalForChart(id){
  const range=trendRangeKey();
  if(range==='quarter'){
    if(id==='english')return Number(data.englishGoal)||null;
    if(id==='gym')return Number(data.gymGoal)||null;
  }
  if(range==='year'){
    if(id==='english')return Number(data.englishGoal)?Number(data.englishGoal)*52/12:null;
    if(id==='gym')return Number(data.gymGoal)?Number(data.gymGoal)*52/12:null;
  }
  if(range==='all'){
    if(id==='english')return Number(data.englishGoal)?Number(data.englishGoal)*13:null;
    if(id==='gym')return Number(data.gymGoal)?Number(data.gymGoal)*13:null;
  }
  return trendGoal(id);
}
function trendValueForDay(id,dateKey){
  const row=data.logs?.[dateKey]||{};

  if(id==='english'){
    const detailed=englishTypes.reduce((s,[typeId])=>s+(Number(row[typeId])||0),0);
    const v=detailed || (Number(row.english_general)||0);
    return v>0?v:null;
  }

  if(id==='gym'){
    return row.gym===true?1:row.gym===false?0:null;
  }

  if(!weeklyHasOwn(row,id)||typeof row[id]==='boolean')return null;
  const n=Number(row[id]);
  if(!Number.isFinite(n))return null;
  if(id==='weight' || id==='sleep')return n>0?n:null;
  return n>=0?n:null;
}
function trendDateObj(dateKey){return weeklyParseDate(dateKey)}
function trendLocalDate(d){return localDate(d)}
function trendAddDays(dateKey,n){return weeklyAddDays(dateKey,n)}
function trendMonday(dateKey){return weeklyMonday(dateKey)}
function trendMonthStart(dateKey){
  const d=trendDateObj(dateKey);
  return trendLocalDate(new Date(d.getFullYear(),d.getMonth(),1,12));
}
function trendQuarterStart(dateKey){
  const d=trendDateObj(dateKey);
  const qMonth=Math.floor(d.getMonth()/3)*3;
  return trendLocalDate(new Date(d.getFullYear(),qMonth,1,12));
}
function trendMonthEnd(dateKey){
  const d=trendDateObj(dateKey);
  return trendLocalDate(new Date(d.getFullYear(),d.getMonth()+1,0,12));
}
function trendQuarterEnd(dateKey){
  const d=trendDateObj(dateKey);
  const qMonth=Math.floor(d.getMonth()/3)*3;
  return trendLocalDate(new Date(d.getFullYear(),qMonth+3,0,12));
}
function trendAddMonths(dateKey,n){
  const d=trendDateObj(dateKey);
  return trendLocalDate(new Date(d.getFullYear(),d.getMonth()+n,1,12));
}
function trendEarliestMetricDate(id){
  const keys=Object.keys(data.logs||{}).sort();
  return keys.find(k=>trendValueForDay(id,k)!==null)||localDate();
}
function trendDailyRange(start,end){
  const out=[];
  for(let d=start;;d=trendAddDays(d,1)){
    out.push(d);
    if(d>=end)break;
  }
  return out;
}
function trendRawSeries(id){
  const today=localDate();

  if(trendRangeDays==='all'){
    const start=trendEarliestMetricDate(id);
    return trendDailyRange(start,today).map((date,index)=>({
      date,index,value:trendValueForDay(id,date)
    }));
  }

  const n=Number(trendRangeDays)||7;
  const keys=dates(n);
  return keys.map((date,index)=>({date,index,value:trendValueForDay(id,date)}));
}
function trendRecorded(series,id){
  if(id==='gym')return series;
  return series.filter(x=>x.value!==null);
}
function trendSetRange(n){
  trendRangeDays=n;
  trendSelectedPoint=null;
  renderTrends();
}
function setTrendRange(n){
  const allowed=[7,30,90,365,'all'];
  if(!allowed.includes(n))n=7;
  trendSetRange(n);
}
function setTrendMetric(id){
  if(!TREND_METRICS.some(x=>x.id===id))return;
  trendMetricId=id;
  trendSelectedPoint=null;
  renderTrends();
}
function trendFormatNumber(v,id=trendMetricId){
  if(v===null||v===undefined||!Number.isFinite(Number(v)))return '—';
  const n=Number(v);
  if(id==='steps')return Math.round(n).toLocaleString((data.language||'ru')==='en'?'en-NZ':'ru-RU');
  if(id==='gym')return String(Math.round(n));
  const rounded=Math.round(n*10)/10;
  return String(rounded);
}
function trendFormatDate(dateKey){
  const locale=(data.language||'ru')==='en'?'en-NZ':'ru-RU';
  return trendDateObj(dateKey).toLocaleDateString(locale,{day:'numeric',month:'short'});
}
function trendFormatMonth(dateKey){
  const locale=(data.language||'ru')==='en'?'en-NZ':'ru-RU';
  return trendDateObj(dateKey).toLocaleDateString(locale,{month:'short',year:'numeric'});
}
function trendFormatMonthShort(dateKey){
  const locale=(data.language||'ru')==='en'?'en-NZ':'ru-RU';
  return trendDateObj(dateKey).toLocaleDateString(locale,{month:'short'});
}
function trendQuarterLabel(dateKey,withYear=true){
  const d=trendDateObj(dateKey);
  const q=Math.floor(d.getMonth()/3)+1;
  return withYear?`Q${q} ${d.getFullYear()}`:`Q${q}`;
}
function trendPeriodLabel(row){
  if(!row)return '';
  if(row.bucket==='week'){
    return `${trendFormatDate(row.startDate)} – ${trendFormatDate(row.endDate)}`;
  }
  if(row.bucket==='month'){
    return trendFormatMonth(row.startDate);
  }
  if(row.bucket==='quarter'){
    return trendQuarterLabel(row.startDate,true);
  }
  return trendFormatDate(row.date);
}
function trendBucketValue(id,rows){
  if(id==='gym'){
    return {
      value:rows.filter(r=>r.value===1).length,
      logged:rows.filter(r=>r.value===1).length
    };
  }

  const vals=rows.filter(r=>r.value!==null).map(r=>Number(r.value));
  if(!vals.length)return {value:null,logged:0};

  if(id==='english'){
    return {value:vals.reduce((s,v)=>s+v,0),logged:vals.length};
  }

  return {
    value:vals.reduce((s,v)=>s+v,0)/vals.length,
    logged:vals.length
  };
}
function trendAggregateWeekly(id,daily){
  if(!daily.length)return [];
  const first=trendMonday(daily[0].date);
  const last=trendMonday(daily[daily.length-1].date);
  const starts=[];
  for(let s=first;;s=trendAddDays(s,7)){
    starts.push(s);
    if(s===last)break;
  }

  return starts.map((startDate,index)=>{
    const endDate=trendAddDays(startDate,6);
    const rows=daily.filter(r=>r.date>=startDate && r.date<=endDate);
    const agg=trendBucketValue(id,rows);
    return {date:startDate,startDate,endDate,index,bucket:'week',...agg};
  });
}
function trendLast12MonthStarts(){
  const today=trendDateObj(localDate());
  const current=new Date(today.getFullYear(),today.getMonth(),1,12);
  const out=[];
  for(let i=11;i>=0;i--){
    out.push(trendLocalDate(new Date(current.getFullYear(),current.getMonth()-i,1,12)));
  }
  return out;
}
function trendAggregateMonthly(id,daily){
  const starts=trendLast12MonthStarts();
  return starts.map((startDate,index)=>{
    const endDate=trendMonthEnd(startDate);
    const rows=daily.filter(r=>r.date>=startDate && r.date<=endDate);
    const agg=trendBucketValue(id,rows);
    return {date:startDate,startDate,endDate,index,bucket:'month',...agg};
  });
}
function trendQuarterStartsFromMetric(id){
  const first=trendQuarterStart(trendEarliestMetricDate(id));
  const last=trendQuarterStart(localDate());
  const out=[];
  for(let s=first;;s=trendAddMonths(s,3)){
    out.push(s);
    if(s===last)break;
  }
  return out;
}
function trendAggregateQuarterly(id,daily){
  const starts=trendQuarterStartsFromMetric(id);
  return starts.map((startDate,index)=>{
    const endDate=trendQuarterEnd(startDate);
    const rows=daily.filter(r=>r.date>=startDate && r.date<=endDate);
    const agg=trendBucketValue(id,rows);
    return {date:startDate,startDate,endDate,index,bucket:'quarter',...agg};
  });
}
function trendChartSeries(id,daily){
  const range=trendRangeKey();
  if(range==='quarter')return trendAggregateWeekly(id,daily);
  if(range==='year')return trendAggregateMonthly(id,daily);
  if(range==='all')return trendAggregateQuarterly(id,daily);
  return daily.map(r=>({...r,startDate:r.date,endDate:r.date,bucket:'day',logged:r.value!==null?1:0}));
}
function trendAggregationText(id){
  const range=trendRangeKey();

  if(range==='week'){
    return trText(
      '7 дней: каждое записанное дневное значение. Нажми на точку, чтобы увидеть цифру.',
      '7 days: every logged daily value. Tap a point to see the exact value.'
    );
  }
  if(range==='month'){
    return trText(
      '30 дней: дневные значения; пропуски не превращаются в нули. Нажми на точку.',
      '30 days: daily values; missing days are not converted to zero. Tap a point.'
    );
  }
  if(range==='quarter'){
    if(id==='english')return trText(
      '3 месяца: сумма English по каждой календарной неделе. Нажми на точку.',
      '3 months: total English time by calendar week. Tap a point.'
    );
    if(id==='gym')return trText(
      '3 месяца: количество тренировок за каждую календарную неделю. Нажми на столбец.',
      '3 months: workouts per calendar week. Tap a bar.'
    );
    return trText(
      '3 месяца: среднее по записанным дням каждой календарной недели. Нажми на точку.',
      '3 months: average across logged days in each calendar week. Tap a point.'
    );
  }
  if(range==='year'){
    if(id==='english')return trText(
      '1 год: 12 точек — сумма English за каждый месяц.',
      '1 year: 12 points — total English time for each month.'
    );
    if(id==='gym')return trText(
      '1 год: 12 столбцов — количество тренировок за каждый месяц.',
      '1 year: 12 bars — workout count for each month.'
    );
    return trText(
      '1 год: 12 точек — среднее значение за каждый календарный месяц.',
      '1 year: 12 points — average value for each calendar month.'
    );
  }

  if(id==='english')return trText(
    'Всё время: одна точка = сумма English за квартал.',
    'All time: one point = total English time for a quarter.'
  );
  if(id==='gym')return trText(
    'Всё время: один столбец = количество тренировок за квартал.',
    'All time: one bar = workout count for a quarter.'
  );
  return trText(
    'Всё время: одна точка = среднее значение за квартал.',
    'All time: one point = average value for a quarter.'
  );
}
function trendSummary(id,daily){
  const recorded=trendRecorded(daily,id);
  const unit=trendMetricUnit(id);
  const spacedUnit=unit?` ${unit}`:'';
  const rangeLabel=trendRangeDays==='all'
    ?trText('за всё время','all time')
    :`${trendRangeDays} ${trText('дней','days')}`;

  if(id==='gym'){
    const sessions=daily.filter(x=>x.value===1).length;
    return {
      primary:`${sessions} ${trText('сесс.','sessions')}`,
      secondary:`${rangeLabel} · ${trText('недельная цель','weekly goal')} ${data.gymGoal}`,
      change:'',
      neutral:false
    };
  }

  if(!recorded.length){
    return {
      primary:'—',
      secondary:trText('За выбранный период записей нет.','No entries in the selected period.'),
      change:'',
      neutral:true
    };
  }

  const first=recorded[0],last=recorded[recorded.length-1];
  const avg=recorded.reduce((s,x)=>s+x.value,0)/recorded.length;

  if(id==='weight'){
    const delta=recorded.length>1?Math.round((last.value-first.value)*10)/10:null;
    return {
      primary:`${trendFormatNumber(last.value,id)}${spacedUnit}`,
      secondary:`${trendFormatDate(last.date)} · ${recorded.length} ${trText('взвешиваний','weigh-ins')}`,
      change:delta===null?'':`${weeklySigned(delta,spacedUnit)} ${trText('за период','over range')}`,
      neutral:true
    };
  }

  if(id==='english'){
    const total=recorded.reduce((s,x)=>s+x.value,0);
    return {
      primary:weeklyFormatMinutes(total),
      secondary:`${recorded.length} ${trText('дней с практикой','days with practice')} · ${rangeLabel}`,
      change:`${trText('Среднее','Average')}: ${trendFormatNumber(avg,id)} ${trText('мин/день практики','min/practice day')}`,
      neutral:false
    };
  }

  const goal=trendGoal(id);
  const goalDays=goal?recorded.filter(x=>x.value>=goal).length:null;

  return {
    primary:`${trendFormatNumber(avg,id)}${spacedUnit} avg`,
    secondary:goal
      ?`${recorded.length} ${trText('дней записано','days logged')} · ${goalDays} ${trText('дн. на цели','days at goal')}`
      :`${recorded.length} ${trText('дней записано','days logged')}`,
    change:recorded.length>1
      ?`${trendFormatNumber(first.value,id)} → ${trendFormatNumber(last.value,id)}${spacedUnit}`
      :'',
    neutral:false
  };
}
function trendScale(id,series){
  const values=series.filter(r=>r.value!==null).map(r=>Number(r.value));
  const goal=trendGoalForChart(id);
  if(goal!==null && goal!==undefined && Number.isFinite(goal))values.push(goal);

  if(!values.length)return {min:0,max:1};

  let min=Math.min(...values),max=Math.max(...values);

  if(id==='weight'){
    const center=(min+max)/2;
    const span=Math.max(4,max-min);
    min=center-span/2-.4;
    max=center+span/2+.4;
    min=Math.floor(min*2)/2;
    max=Math.ceil(max*2)/2;
    return {min,max};
  }

  if(id==='sleep'){
    const center=(min+max)/2;
    const span=Math.max(3,max-min);
    min=Math.max(0,Math.floor((center-span/2-.35)*2)/2);
    max=Math.ceil((center+span/2+.35)*2)/2;
    return {min,max};
  }

  max=Math.max(max,1)*1.10;

  if(id==='steps')max=Math.ceil(max/1000)*1000;
  else if(id==='english')max=Math.ceil(max/60)*60;
  else if(id==='outdoors')max=Math.ceil(max/30)*30;
  else if(id==='protein')max=Math.ceil(max/20)*20;
  else if(id==='gym')max=Math.max(1,Math.ceil(max));
  else max=Math.ceil(max);

  return {min:0,max};
}
function trendLineSegments(id,series,x,y){
  const connectAcrossMissing=id==='weight';
  const segments=[];
  let current=[];

  for(const row of series){
    if(row.value===null){
      if(!connectAcrossMissing && current.length){
        segments.push(current);
        current=[];
      }
      continue;
    }
    current.push({...row,x:x(row.index),y:y(row.value)});
  }
  if(current.length)segments.push(current);

  if(connectAcrossMissing){
    const all=series.filter(r=>r.value!==null).map(r=>({...r,x:x(r.index),y:y(r.value)}));
    return all.length?[all]:[];
  }
  return segments;
}
function trendAxisLabels(id,series,scale){
  const {min,max}=scale;
  const yValues=[max,(min+max)/2,min].map(v=>trendFormatNumber(v,id));

  const nonEmpty=series.filter(r=>r.value!==null);
  const source=nonEmpty.length?nonEmpty:series;
  if(!source.length)return {y:yValues,x:[]};

  const rawIndices=series.length>=7
    ?[0,Math.round((series.length-1)/3),Math.round((series.length-1)*2/3),series.length-1]
    :[0,Math.floor((series.length-1)/2),series.length-1];
  const candidateIndices=rawIndices.filter((v,i,a)=>v>=0 && a.indexOf(v)===i);

  const x=candidateIndices.map((idx,pos)=>{
    const row=series[idx];
    let label='';
    if(row.bucket==='month')label=trendFormatMonthShort(row.startDate);
    else if(row.bucket==='quarter')label=trendQuarterLabel(row.startDate,true);
    else if(row.bucket==='week')label=trendFormatDate(row.startDate);
    else label=trendFormatDate(row.date);

    return {
      index:idx,
      pct:series.length<=1?50:(idx/(series.length-1))*100,
      label,
      cls:pos===0?'first':(pos===candidateIndices.length-1?'last':'')
    };
  });

  return {y:yValues,x};
}
function trendPointDetailText(id,row){
  const unit=trendMetricUnit(id);
  const spacedUnit=unit?` ${unit}`:'';

  let value='';
  if(id==='english')value=weeklyFormatMinutes(row.value||0);
  else if(id==='gym')value=`${trendFormatNumber(row.value,id)} ${trText('тренировок','workouts')}`;
  else value=`${trendFormatNumber(row.value,id)}${spacedUnit}`;

  let meta='';
  if(row.bucket==='day'){
    meta=trText('Дневное значение','Daily value');
  }else if(id==='english'){
    meta=`${row.logged||0} ${trText('дней с практикой внутри периода','practice days in this period')}`;
  }else if(id==='gym'){
    meta=trText('Количество тренировок в периоде','Workout count in this period');
  }else{
    meta=`${trText('Среднее по','Average across')} ${row.logged||0} ${trText('записанным дням','logged days')}`;
  }

  return {period:trendPeriodLabel(row),value,meta};
}
function selectTrendPoint(index){
  const daily=trendRawSeries(trendMetricId);
  const chartSeries=trendChartSeries(trendMetricId,daily);
  const row=chartSeries[Number(index)];
  if(!row || row.value===null)return;

  trendSelectedPoint=Number(index);

  const detail=document.getElementById('trendPointDetail');
  const p=document.getElementById('trendPointDetailPeriod');
  const v=document.getElementById('trendPointDetailValue');
  const m=document.getElementById('trendPointDetailMeta');

  const txt=trendPointDetailText(trendMetricId,row);
  if(detail)detail.hidden=false;
  if(p)p.textContent=txt.period;
  if(v)v.textContent=txt.value;
  if(m)m.textContent=txt.meta;

  document.querySelectorAll('.trend-hit,.trend-bar-hit').forEach(el=>{
    el.classList.toggle('selected',Number(el.dataset.index)===trendSelectedPoint);
  });
}
function trendChartHTML(id,series){
  return sharedChartHTML({
    series,
    scale:trendScale(id,series),
    goal:trendGoalForChart(id),
    selectedIndex:trendSelectedPoint,
    onSelectName:'selectTrendPoint',
    connectAcrossMissing:id==='weight',
    bars:id==='gym',
    emptyText:trText(
      'Для графика нужно минимум две записи за выбранный период.',
      'At least two entries are needed for a chart in this range.'
    ),
    formatY:(v)=>trendFormatNumber(v,id),
    periodLabel:(row)=>trendPeriodLabel(row),
    formatX:(row)=>{
      if(row.bucket==='month')return trendFormatMonthShort(row.startDate);
      if(row.bucket==='quarter')return trendQuarterLabel(row.startDate,true);
      if(row.bucket==='week')return trendFormatDate(row.startDate);
      return trendFormatDate(row.date);
    }
  });
}
function renderTrends(){
  const host=document.getElementById('trendChartHost');
  if(!host)return;

  const buttons=[
    ['trendRange7Btn',7],
    ['trendRange30Btn',30],
    ['trendRange90Btn',90],
    ['trendRange365Btn',365],
    ['trendRangeAllBtn','all']
  ];
  buttons.forEach(([id,value])=>{
    const el=document.getElementById(id);
    if(el)el.className=trendRangeDays===value?'secondary':'ghost';
  });

  const tabs=document.getElementById('trendMetricTabs');
  if(tabs){
    tabs.innerHTML=TREND_METRICS.map(m=>`
      <button class="trend-metric-tab ${trendMetricId===m.id?'active':''}" onclick="setTrendMetric('${m.id}')">
        ${m.icon} ${(data.language||'ru')==='en'?m.en:m.ru}
      </button>
    `).join('');
  }

  const daily=trendRawSeries(trendMetricId);
  const chartSeries=trendChartSeries(trendMetricId,daily);
  const summary=trendSummary(trendMetricId,daily);
  const def=trendMetricDef(trendMetricId);

  const title=document.getElementById('trendTitle');
  const primary=document.getElementById('trendPrimary');
  const secondary=document.getElementById('trendSecondary');
  const change=document.getElementById('trendChange');
  const aggregation=document.getElementById('trendAggregationNote');
  const detail=document.getElementById('trendPointDetail');

  if(title)title.textContent=`${def.icon} ${trendMetricName(trendMetricId)}`;
  if(primary)primary.textContent=summary.primary;
  if(secondary)secondary.textContent=summary.secondary;
  if(change){
    change.textContent=summary.change||trText('Выбери показатель','Choose a metric');
    change.className='trend-change'+(summary.neutral?' neutral':'');
  }
  if(aggregation)aggregation.textContent=trendAggregationText(trendMetricId);
  if(detail && trendSelectedPoint===null)detail.hidden=true;

  host.innerHTML=trendChartHTML(trendMetricId,chartSeries);

  if(trendSelectedPoint!==null){
    const selected=chartSeries[trendSelectedPoint];
    if(selected && selected.value!==null)selectTrendPoint(trendSelectedPoint);
    else{
      trendSelectedPoint=null;
      if(detail)detail.hidden=true;
    }
  }
}
// V6.7.3_TRENDS_END

function renderProgress(){renderSimpleProgress();renderTrends();renderCalendar()}
function moveMonth(n){calendarDate=new Date(calendarDate.getFullYear(),calendarDate.getMonth()+n,1);renderCalendar()}
function renderCalendar(){const ruM=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],enM=['January','February','March','April','May','June','July','August','September','October','November','December'],ruD=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],enD=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],y=calendarDate.getFullYear(),m=calendarDate.getMonth(),lang=data.language||'ru';document.getElementById('calendarTitle').textContent=(lang==='en'?enM:ruM)[m]+' '+y;const grid=document.getElementById('calendarGrid');grid.innerHTML=(lang==='en'?enD:ruD).map(x=>`<div class="dow">${x}</div>`).join('');const first=(new Date(y,m,1).getDay()+6)%7,total=new Date(y,m+1,0).getDate();for(let i=0;i<first;i++)grid.innerHTML+='<div></div>';for(let day=1;day<=total;day++){const d=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,filled=Object.keys(data.logs[d]||{}).filter(k=>k!=='habitDetails'&&weeklyHasOwn(data.logs[d],k)&&data.logs[d][k]!==false).length,cls=filled>=5?'good':filled>=2?'mid':'';grid.innerHTML+=`<div class="cday ${cls}">${day}${filled>=5?'<span class="dot"></span>':''}</div>`}}

function openExperiment(){document.getElementById('experimentModal')?.classList.add('show')}
function saveExperiment(){
 const nameEl=document.getElementById('expName'),metricEl=document.getElementById('expMetric'),targetEl=document.getElementById('expTarget'),daysEl=document.getElementById('expDays'),hypEl=document.getElementById('expHypothesis');
 const name=(nameEl?.value||'').trim();if(!name)return;
 data.experiments.push({id:'exp_'+Date.now(),name,metric:metricEl?.value||'outdoors',target:Number(targetEl?.value||0),days:Number(daysEl?.value||30),start:localDate(),hypothesis:(hypEl?.value||'').trim(),status:'active'});
 if(nameEl)nameEl.value='';if(targetEl)targetEl.value='';if(daysEl)daysEl.value='30';if(hypEl)hypEl.value='';
 closeModal('experimentModal');save()
}
function expProgress(e){const elapsed=Math.max(0,weeklyDiffDays(e.start,localDate())+1);return Number.isFinite(elapsed)?Math.min(100,pct(elapsed,e.days)):0}
function renderExperiments(){const host=document.getElementById('experimentsList');if(!host)return;host.innerHTML='';if(!data.experiments.length){host.innerHTML='<div class="insight-card">Пример: «30 дней проводить ≥60 минут на улице» и потом сравнить сон и английский.</div>';return}data.experiments.forEach(e=>{const t=tracker(e.metric),p=expProgress(e),el=document.createElement('div');el.className='experiment';el.innerHTML=`<div class="exp-head"><div><div class="title">${escapeHTML(t?.icon||'🧪')} ${escapeHTML(e.name)}</div><div class="small">${escapeHTML(e.hypothesis||'Без гипотезы')}</div></div><span class="exp-status">${e.status==='active'?'Активен':'Завершён'}</span></div><div class="progress"><span style="width:${p}%"></span></div><div class="small" style="margin-top:7px">Цель: ${escapeHTML(e.target||'—')} ${escapeHTML(t?.unit||'')} · ${escapeHTML(e.days)} дней · ${p}%</div><div style="margin-top:9px"><button class="secondary" style="padding:8px 10px">${e.status==='active'?'Завершить':'Возобновить'}</button> <button class="ghost" style="padding:8px 10px">Удалить</button></div>`;const bs=el.querySelectorAll('button');bs[0].onclick=()=>{e.status=e.status==='active'?'done':'active';save()};bs[1].onclick=()=>{if(confirm((data.language||'ru')==='en'?'Delete this experiment?':'Удалить эксперимент?')){data.experiments=data.experiments.filter(x=>x.id!==e.id);save()}};host.appendChild(el)})}

function formatBackupDate(value){
  if(!value)return trText('Никогда','Never');
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return trText('Никогда','Never');
  return d.toLocaleDateString((data.language||'ru')==='en'?'en-NZ':'ru-RU',{
    day:'numeric',month:'short',year:'numeric'
  });
}

function updateStorageSafetyUI(){
  const h=window.__vaultHealth||{};
  const flags=[h.primary,h.mirror,h.idb,h.cache];
  const copies=flags.filter(Boolean).length;

  const status=document.getElementById('vaultStatusText');
  const snaps=document.getElementById('vaultSnapshotText');
  const last=document.getElementById('lastBackupText');
  const reminder=document.getElementById('backupReminder');

  if(status){
    status.textContent=copies
      ? `${copies}/4 ${trText('локальных копий','local copies')}`
      : trText('Проверяем…','Checking…');
    status.className=copies>=3?'storage-ok':(copies?'storage-warn':'');
  }

  if(snaps)snaps.textContent=h.snapshots!==undefined?String(h.snapshots):'—';
  if(last)last.textContent=formatBackupDate(data.lastExternalBackupAt);

  if(reminder){
    let old=true;
    if(data.lastExternalBackupAt){
      const ms=Date.now()-Date.parse(data.lastExternalBackupAt);
      old=!Number.isFinite(ms)||ms>7*86400000;
    }
    reminder.textContent=old
      ? trText('⚠️ Внешнего backup нет или он старше 7 дней. Локальные копии не переживут удаление PWA/очистку Safari.','⚠️ No recent external backup. Local copies may not survive deleting the PWA or clearing Safari data.')
      : trText('✓ Внешний backup свежий.','✓ External backup is recent.');
    reminder.className='backup-reminder '+(old?'warn':'ok');
  }
}

function renderSettings(){
 const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v??''};
 set('smokeDate',data.smokeDate);set('alcoholDate',data.alcoholDate);set('proteinGoal',data.proteinGoal);set('stepsGoal',data.stepsGoal);set('outdoorsGoal',data.outdoorsGoal);set('sleepGoal',data.sleepGoal);set('englishGoal',data.englishGoal);set('gymGoal',data.gymGoal);
 const av=document.getElementById('appVersionText');if(av)av.textContent='V'+APP_VERSION;
 const sv=document.getElementById('schemaVersionText');if(sv)sv.textContent=String(data.schemaVersion||CURRENT_SCHEMA_VERSION);

 const d=window.__dataDiagnostic||{source:'—',sources:[]};
 const ds=document.getElementById('dataSourceText');
 const dl=document.getElementById('dataLogDaysText');
 const da=document.getElementById('dataAlcoholDatesText');
 const db=document.getElementById('dataBodyCheckinsText');
 const dd=document.getElementById('dataSourcesDetails');

 if(ds)ds.textContent=d.source||'—';
 if(dl)dl.textContent=String(Object.keys(data.logs||{}).length);
 if(da)da.textContent=String(Object.values(data.alcoholHistory||{}).filter(Boolean).length);
 if(db)db.textContent=String(Object.values(data.bodyMeasurements||{}).filter(row=>row&&typeof row==='object'&&Object.values(row).some(v=>Number(v)>0)).length);
 if(dd)dd.textContent=(d.sources||[]).map(x=>`${x.key}: ${x.logDays} ${trText('дней','days')}`).join(' · ');

 updateStorageSafetyUI();
 renderExperiments();
}
function render(){applyTheme();for(const job of [renderToday,renderEnglish,renderProgress,renderSettings]){try{job()}catch(e){console.error('Render error in '+job.name,e)}}try{translateDOM()}catch(e){console.error('Translation error',e)}}

let appActiveDate=localDate();
function rebuildEnglishReviewQueueForToday(){
  ensureEnglishDailyQueue(localDate(),{persist:true});
  englishReviewQueueIds=englishDueItems(localDate()).map(x=>x.id);
  englishReviewInitialTotal=englishReviewQueueIds.length;
  englishReviewAnswerShown=false;
}
function checkAppDayRollover(){
  const today=localDate();
  if(today===appActiveDate)return false;
  appActiveDate=today;
  ensureEnglishDailyQueue(today,{persist:true});
  render();
  const learningModal=document.getElementById('englishLearningModal');
  if(learningModal?.classList.contains('show')){
    if(englishLearningView==='review')rebuildEnglishReviewQueueForToday();
    renderEnglishLearning();
  }
  return true;
}

if('serviceWorker'in navigator){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
render();
recoverFromVaults()
  .then(()=>{
    ensureEnglishDailyQueue(localDate(),{persist:true});
    appActiveDate=localDate();
    render();
  })
  .catch(err=>{console.warn('Vault recovery failed',err);updateStorageSafetyUI()});

addEventListener('pagehide',flushEnglishPlanDraft);
addEventListener('focus',checkAppDayRollover);
document.addEventListener('visibilitychange',()=>{
  if(document.hidden)flushEnglishPlanDraft();
  else checkAppDayRollover();
});
setInterval(checkAppDayRollover,60000);

addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  if(document.getElementById('habitModal')?.classList.contains('show'))return closeHabitEditor();
  if(document.getElementById('englishAddModal')?.classList.contains('show'))return closeEnglishAdd();
  if(document.getElementById('englishLearningModal')?.classList.contains('show'))return englishLearningBack();
  if(document.getElementById('motivationModal')?.classList.contains('show'))return closeMotivationDetail();
  if(document.getElementById('bodyCheckinModal')?.classList.contains('show'))return closeBodyCheckin();
  if(document.getElementById('bodyModal')?.classList.contains('show'))return closeBody();
  if(document.getElementById('alcoholModal')?.classList.contains('show'))return closeAlcohol();
})
