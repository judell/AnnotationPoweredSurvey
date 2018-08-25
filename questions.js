 const questions = {
  'Q01' : {
    'type' : 'radio',
    'title' : 'Overall Credibility',
    'question' : 'Rate your impression of the credibility of this article',
    'choices' : [
      '1.01.01:Very low credibility',
      '1.01.02:Somewhat low credibility',
      '1.01.03:Medium credibility',
      '1.01.04:Somewhat high credibility',      
      '1.01.05:High credibility',      
    ],
    'anchored' : false,
  },
  'Q02' : {
    'type' : 'radio',
    'title' : 'Title Representativeness',
    'question' : 'Does the title of the article accurately reflect the content of the article?',
    'prompt' : 'Please select the title',
    'choices' : [
      '1.02.01:Completely Unrepresentative',
      '1.02.02:Somewhat Unrepresentative',
      '1.02.03:Somewhat Representative',
      '1.02.04:Completely Representative',      
    ],
    'anchored' : true,
  },
  'Q03' : {
    'type' : 'checkbox',
    'title' : 'Title Representativeness',
    'question' : 'How is the title unrepresentative? (select all that apply)',
    'requires' : {
      'target': 'Q02',
      'oneOf' : ['1.02.01','1.02.02'],
    },
    'choices' : [
      '1.03.01:Title is on a different topic than the body',
      '1.03.02:Title emphasizes different information than the body',
      '1.03.03:Title carries little information about the body',
      '1.03.04:Title takes a different stance than the body',
      '1.03.05:Title overstates claims or conclusions in the body',
      '1.03.06:Title understates claims or conclusions in the body',
      '1.03.07:Other'
    ],
    'anchored' : true,
  },
  'Q03_01' : {
    'type' : 'textarea',
    'title' : 'Title Representativeness',
    'question' : 'Please describe other ways in which the title is not representative',
    'anchored' : true,
    'requires' : {
      'target' : 'Q03',
      'contains' : '1.03.07'
    },
  },
  'Q04' : {
    'type': 'radio',
    'title': 'Clickbaitiness',
    'question': 'Is the headline clickbaity',
    'anchored': true,
    'choices' :[
      '1.04.01:Very much clickbaity',
      '1.04.02:Somewhat clickbaity',
      '1.04.03:A little bit clickbaity',
      '1.04.04:Not at all clickbaity',
    ],
  },
  'Q05' : {
    'type': 'checkbox',
    'title': 'Clickbaitiness',
    'prompt': 'Select all that apply',
    'question': 'What clickbait techniques does this headline employ?',
    'anchored': true,
    'requires' : {
      'target': 'Q04',
      'oneOf' : ['1.04.01','1.04.02','1.04.03'],
    },
    'choices' : [
      '1.05.01:Listicle ("6 Tips on ...")',
      '1.05.02:Cliffhanger to a story ("You Won\'t Believe What Happens Next")',
      '1.05.03:Provoking emotions, such as shock or surprise ("...Shocking Result", "...Leave You in Tears")',
      '1.05.04:Hidden secret or trick ("Fitness Companies Hate Him...", "Experts are Dying to Know Their Secret")',
      '1.05.05:Challenges to the ego ("Only People with IQ Above 160 Can Solve This")',
      '1.05.06:Defying convention ("Think Orange Juice is Good for you? Think Again!", "Here are 5 Foods You Never Thought Would Kill You")',
      '1.05.07:Inducing fear ("Is Your Boyfriend Cheating on You?")',
      '1.05.08:Other',       
    ],
  },
  'Q06' : {
    'type' : 'textarea',
    'title' : 'Clickbaitiness',
    'question' : 'Please describe other ways in which the title is clickbaity',
    'anchored' : true,
    'requires' : {
      'target' : 'Q05',
      'contains' : '1.05.08'
    },
  },
  'Q07' : {
    'type' : 'radio',
    'title' : 'Single study?',
    'question' : 'Is the article primarily about a single scientific study?',
    'choices' : [
      '1.07.01:Yes',
      '1.07.02:No',
    ],
    'anchored' : false,
  },
  'Q08a' : {
    'type' : 'radio',
    'title' : 'Types of sources',
    'question' : 'Does the article cite sources?',
    'choices' : [
      '1.08a.01:Yes',
      '1.08a.02:No',
    ],
    'anchored' : false,
  },  
  'Q08b' : {
    'type' : 'checkbox',
    'title' : 'Types of sources',
    'question' : 'Which of the following are cited?',
    'requires' : {
      'target' : 'Q08a',
      'equal' : '1.08a.01',
    },    
    'choices' : [
      '1.08.01:Experts',
      '1.08.02:Studies',
      '1.08.03:Organizations',      
    ],
    'anchored' : false,
  },
  'Q09_01' : {
    'type' : 'highlight',
    'title' : 'Expert sources',
    'question' : 'Highlight expert source',
    'anchored': true,
    'requires' : {
      'target': 'Q08b',
      'contains' : '1.08.01',
    },
  'repeatable' : true,
  },
  'Q10_01' : {
    'type' : 'highlight',
    'title' : 'Studies',
    'question' : 'Highlight study',
    'anchored': true,
    'requires' : {
      'target': 'Q08b',
      'contains' : '1.08.02',
    },
    'repeatable': true,
    },
  'Q11_01' : {
    'type' : 'highlight',
    'title' : 'Organizations',
    'question' : 'Highlight organization',
    'anchored': true,
    'requires' : {
      'target': 'Q08b',
      'contains' : '1.08.03',
    },
    'repeatable' : true
  },
  'Q12' : {
    'type' : 'radio',
    'title' : 'Other types of sources',
    'question' : 'Are any experts, organizations, or studies separate from the central study quoted in the article?',
    'choices' : [
      '1.12.01:Yes',
      '1.12.02:No',
    ],
    'anchored' : false,
  },  
  'Q12_01' : {
    'type' : 'highlight',
    'title' : 'Other types of sources',
    'question' : 'Other source',
    'anchored': true,
    'requires' : {
      'target': 'Q12',
      'contains' : '1.12.01',
    },
    'repeatable' : true,
  },
  'Q13' : {
    'type' : 'radio',
    'title' : 'Confidence in claims made by sources',
    'question' : 'To what extent does the author\'s confidence in claims made by sources seem justified?',
    'anchored': false,
    'requires' : {
      'target': 'Q12',
      'contains' : '1.12.01',
    },
    'choices' : [
      '1.13.01:Completely justified',
      '1.13.02:Mostly justified',
      '1.13.03:Somewhat justified',
      '1.13.04:Slightly justified',
      '1.13.05:Not at all justified',
    ],
  },
  'Q14' : {
    'type' : 'radio',
    'title' : 'Acknowledgement of uncertainty',
    'question' : 'Does the author acknowledge uncertainty, or the possibility things might be otherwise?',
    'anchored': false,
    'requires' : {
      'target': 'Q13',
      'oneOf' : ['1.13.01', '1.13.02', '1.13.03'],
    },
    'choices' : [
      '1.14.01:Yes',
      '1.14.02:Sort of',
      '1.14.03:No',
    ],
  },
  'Q14_01' : {
    'type' : 'highlight',
    'title' : 'Acknowledgement of uncertainty',
    'question' : 'Highlight uncertainty example',
    'anchored': true,
    'requires' : {
      'target': 'Q14',
      'oneOf' : ['1.14.01', '1.14.02'],
    },
    'repeatable' : true,
  },
  'Q15' : {
    'type' : 'radio',
    'title' : 'Straw man argument',
    'question' : 'Does the author present a counterargument as a weaker, more foolish version of the real counterargument?',
    'anchored': false,
    'choices' : [
      '1.15.01:Yes',
      '1.15.02:Sort of',
      '1.15.03:No',
    ],
  },
  'Q15_01' : {
    'type' : 'highlight',
    'title' : 'Straw man argument',
    'question' : 'Highlight straw man example',
    'anchored': true,
    'requires' : {
      'target' : 'Q15',
      'oneOf' : ['1.15.01', '1.15.02']
    },
    'repeatable' : true,
  },
  'Q16' : {
    'type' : 'radio',
    'title' : 'False dilemma',
    'question' : 'Does the author present a complicated choice as if it were binary?',
    'anchored': false,
    'choices' : [
      '1.16.01:Yes',
      '1.16.02:Sort of',
      '1.16.03:No',
    ],
  },
  'Q16_01' : {
    'type' : 'highlight',
    'title' : 'False dilemma',
    'question' : 'Highlight false dilemma example',
    'anchored': true,
    'requires' : {
      'target' : 'Q16',
      'oneOf' : ['1.16.01', '1.16.02']
    },
    'repeatable' : true,
  },
  'Q17' : {
    'type' : 'radio',
    'title' : 'Slippery slope',
    'question' : 'Does the author say that one small change will lead to a major change?',
    'anchored': false,
    'choices' : [
      '1.17.01:Yes',
      '1.17.02:Sort of',
      '1.17.03:No',
    ],
  },
  'Q17_01' : {
    'type' : 'highlight',
    'title' : 'Slippery slope',
    'question' : 'Highlight slippery slope example',
    'anchored': true,
    'requires' : {
      'target' : 'Q17',
      'oneOf' : ['1.17.01', '1.17.02']
    },
    'repeatable' : true,
  },
  'Q18' : {
    'type' : 'radio',
    'title' : 'Scare tactics',
    'question' : 'Does the author exaggerate the dangers of a situation (the appeal to fear fallacy)?',
    'anchored': false,
    'choices' : [
      '1.18.01:Yes',
      '1.18.02:Sort of',
      '1.18.03:No',
    ],
  },
  'Q18_01' : {
    'type' : 'highlight',
    'title' : 'Scare tactics',
    'question' : 'Highlight scare tactic example',
    'anchored': true,
    'requires' : {
      'target' : 'Q18',
      'oneOf' : ['1.18.01', '1.18.02']
    },
    'repeatable' : true,
  },
  'Q19' : {
    'type' : 'radio',
    'title' : 'Naturalistic fallacy',
    'question' : 'Does the author suggest something is good because it is natural, or bad because it is not natural?',
    'anchored': false,
    'choices' : [
      '1.19.01:Yes',
      '1.19.02:Sort of',
      '1.19.03:No',
    ],
  },
  'Q19_01' : {
    'type' : 'highlight',
    'title' : 'Naturalistic fallacy',
    'question' : 'Highlight naturalistic fallacy example',
    'anchored': true,
    'requires' : {
      'target' : 'Q19',
      'oneOf' : ['1.19.01', '1.19.02']
    },
    'repeatable' : true,
  },
  'Q20' : {
    'type' : 'radio',
    'title' : 'Emotionally charged tone',
    'question' : 'Does the author use outrage, snark, celebration, horror, etc?',
    'anchored': false,
    'choices' : [
      '1.20.01:Yes',
      '1.20.02:Sort of',
      '1.20.03:No',
    ],
  },
  'Q20_01' : {
    'type' : 'highlight',
    'title' : 'Emotionally charged tone',
    'question' : 'Highlight charged tone example',
    'anchored': true,
    'requires' : {
      'target' : 'Q20',
      'oneOf' : ['1.20.01', '1.20.02']
    },
    'repeatable' : true,
  },
  'Q21' : {
    'type' : 'radio',
    'title' : 'Exaggerated claims',
    'question' : 'Does the author exaggerate claims?',
    'anchored': false,
    'choices' : [
      '1.21.01:Yes',
      '1.21.02:Sort of',
      '1.21.03:No',
    ],
  },
  'Q21_01' : {
    'type' : 'highlight',
    'title' : 'Exaggerated claims',
    'question' : 'Exaggerate claim example',
    'anchored': true,
    'requires' : {
      'target' : 'Q21',
      'oneOf' : ['1.21.01', '1.21.02']
    },
    'repeatable' : true,
  },
  'Q22' : {
    'type' : 'radio',
    'title' : 'Causal claims',
    'question' : 'Is a general or singular causal claim made?',
    'anchored': false,
    'choices' : [
      '1.22.01:General causal claim',
      '1.22.02:Singular causal claim',
      '1.22.03:No causal claim',
    ],
  },
  'Q22_01' : {
    'type' : 'highlight',
    'title' : 'Causal claims',
    'question' : 'General causal claim example',
    'anchored': true,
    'requires' : {
      'target' : 'Q22',
      'equal' : '1.22.01',
    },
  },
  'Q22_02' : {
    'type' : 'highlight',
    'title' : 'Causal claims',
    'question' : 'Singular causal claim',
    'anchored': true,
    'requires' : {
      'target' : 'Q22',
      'equal' : '1.22.02',
    },
  },
  'Q23' : {
    'type' : 'checkbox',
    'title' : 'Evidence for primary claim',
    'question' : 'What evidence is given for the primary claim?',
    'choices' : [
      '1.23.01:Correlation',
      '1.23.02:Cause precedes effect',
      '1.23.03:The correlation appears across multiple independent contexts',
      '1.23.04:A plausible mechanism is proposed',
      '1.23.05:An experimental study was conducted (natural experiments OK)',
      '1.23.06:Experts are cited',
      '1.23.07:Other kind of evidence',
      '1.23.08:No evidence given',
    ],
    'anchored' : false,
  },  
  'Q24' : {
    'type' : 'textarea',
    'title' : 'Evidence for primary claim',
    'question' : 'What other kind of evidence do they give?',
    'requires' : {
      'target' : 'Q23',
      'equal' : '1.23.07',
    },
    'anchored' : false,
  },  
  'Q25' : { 
    'type' : 'radio',
    'title' : 'Evidence for primary claim',
    'question' : 'How convincing do you find the evidence for the primary claim?',
    'requires' : {
      'target' : 'Q23',
      'oneOf' : ['1.23.01','1.23.02','1.23.03','1.23.04','1.23.05','1.23.06','1.23.07'],
    },
    'choices' : [
      '1.25.01:Very Convincing',
      '1.25.02:Fairly Convincing',
      '1.25.03:Moderately Convincing',
      '1.25.04:Slightly Convincing',
      '1.25.05:Not at All Convincing',
    ]
  },

} 