const fs = require('fs');
const content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
const startIdx = content.indexOf('const fallbackQuotes = [');
const endIdx = content.indexOf('  const totalChapters = chapters.length;');
if (startIdx !== -1 && endIdx !== -1) {
    const newContent = content.slice(0, startIdx) + `const fallbackQuotes = [
        "লক্ষ্যে স্থির থাকো। প্রতিটি মুহূর্তকে কাজে লাগাও! তোমার এই কষ্ট একদিন সফলতার গল্প হবে।",
        "দ্বিতীয়বার মানে আরও একটি সুযোগ, আরও ভালোভাবে প্রস্তুতি নেওয়ার। হাল ছেড়ো না!",
        "যারা নিজের ভুল থেকে শেখে, তারাই চূড়ান্ত বিজয়ী হয়। তোমার এবারের প্রস্তুতি হোক আগের চেয়ে ধারালো।",
        "অতীতের ব্যর্থতা নিয়ে ভেবো না, আজকের পরিশ্রমই তোমার ভবিষ্যৎ গড়ে দেবে।",
        "প্রতিদিন একটু একটু করে এগোও, ধারাবাহিকতা থাকলে সফলতা নিশ্চিত।",
        "তোমার স্বপ্ন বড়, তাই তোমার চেষ্টাও হতে হবে অন্যদের চেয়ে ১০০ গুণ বেশি।",
        "ক্লান্তি আসবে, কিন্তু বিশ্রাম নেওয়ার সময় এখন নয়। নিজের সেরাটা দিয়ে যাও।",
        "বিশ্বাস রাখো নিজের প্রতি। তুমি ঘুরে দাঁড়াতে পারো এবং তুমি পারবেই।",
        "এখনকার ঘাম আর কষ্টগুলোই তোমার ভবিষ্যতের সবচেয়ে সুন্দর হাসি হয়ে ফিরে আসবে।",
        "হেরে যাওয়া মানেই শেষ নয়, এটি নতুন করে আরও বুদ্ধিমানের মতো শুরু করার সুযোগ।"
      ];
      
      const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
      const quote = fallbackQuotes[dayOfYear % fallbackQuotes.length];
      setAiMotivationalQuote({ quote, loading: false });
    };
    fetchQuote();

    return () => clearInterval(timer);
  }, []);\n\n` + content.slice(endIdx);
    fs.writeFileSync('src/components/Dashboard.tsx', newContent);
    console.log("Fixed!");
} else { console.log("Not found boundaries"); }
