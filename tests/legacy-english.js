// Frozen compatibility harness for the retired 6.x learning UI. Not loaded by the app.
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
  return openModule('activity');

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
  return activityMinutes(dateKey);
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
  return openModule('activity');

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
    <button class="english-item-card ${englishIsDue(item)?'due':''}" onclick="openEnglishItem(${inlineArgument(item.id)},'words')">
      <div class="english-item-status">${englishReviewBadge(item)}</div>
      <div><span class="english-item-title">${escapeHTML(item.title)}</span>${item.ipa?`<span class="english-item-ipa">${escapeHTML(item.ipa)}</span>`:''}</div>
      <div class="english-item-ru">${item.translationHidden?trText('Перевод скрыт — открой карточку','Translation hidden — open the card'):escapeHTML(item.ru||'')}</div>
      ${item.example?`<div class="english-item-example">${escapeHTML(item.example)}</div>`:''}
      <div class="english-item-chips"><span class="english-item-chip">${englishKindLabel(item.kind)}</span>${item.level?`<span class="english-item-chip">${escapeHTML(item.level)}</span>`:''}</div>
    </button>
  `).join(''):`<div class="english-review-empty"><strong>${trText('Ничего не найдено','Nothing found')}</strong></div>`;
}
function inlineArgument(value){return escapeHTML(JSON.stringify(String(value)))}
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
    <button class="english-curriculum-card ${englishIsDue(item)?'due':''}" onclick="openEnglishItem(${inlineArgument(item.id)},'grammar')">
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
    <button class="english-item-card ${englishIsDue(item)?'due':''}" onclick="openEnglishItem(${inlineArgument(item.id)},'mistakes')">
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
      ?`<button class="english-plan-reveal english-word-reveal" onclick="toggleEnglishWordTranslation(${inlineArgument(item.id)})">${trText('Показать перевод','Reveal translation')}</button>`
      :`<div class="english-detail-translation">${isMistake?'✓ ':''}${escapeHTML(meaning)}</div>${item.translationHidden&&!isMistake?`<button class="english-plan-reveal english-word-reveal" onclick="toggleEnglishWordTranslation(${inlineArgument(item.id)})">${trText('Скрыть перевод','Hide translation')}</button>`:''}`):''}
    ${item.formula?`<div class="english-detail-section"><div class="label">${trText('Формула','Formula')}</div><div class="english-detail-example english-detail-formula">${escapeHTML(item.formula)}</div></div>`:''}
    ${rule?`<div class="english-detail-section"><div class="label">${trText('Правило','Rule')}</div><div class="english-detail-example">${escapeHTML(rule)}</div></div>`:''}
    ${example?`<div class="english-detail-section"><div class="label">${trText('Пример','Example')}</div><div class="english-detail-example">${escapeHTML(example)}</div></div>`:''}
    <div class="english-detail-section"><div class="label">${trText('Повторение','Review')}</div><div class="small">${state?.nextReview?`${trText('Следующее','Next')}: ${bodyFriendlyDate(state.nextReview)}`:trText('Ещё не повторялось','Not reviewed yet')}</div></div>
    <div class="english-detail-actions ${canPractice?'':'single'}">
      ${canPractice
        ?`<button class="secondary" onclick="openEnglishPractice(${inlineArgument(item.id)})">${trText('Нужна практика','Need practice')}</button>`
        :`<button class="secondary" onclick="quickEnglishReview(${inlineArgument(item.id)},'hard')">${trText('Повторить позже','Review later')}</button>`}
      <button onclick="quickEnglishReview(${inlineArgument(item.id)},'know')">${trText('Понятно','Got it')}</button>
    </div>
    ${englishItemIsCustom(item)?`<button class="danger" style="width:100%;margin-top:8px" onclick="deleteEnglishCustomItem(${inlineArgument(item.id)})">${trText('Удалить','Delete')}</button>`:''}
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


