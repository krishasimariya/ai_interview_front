"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getVapi } from "@/lib/vapi";

interface Message {
  role: "user" | "assistant" | "system";
  text: string;
  ts: string;
}

const ROLE_QUESTIONS: Record<string, string[]> = {
  "Behavioral & Leadership": [
    "Question 1: Welcome! To get started with our interview, could you please introduce yourself, tell me about your background, and share what motivated you to pursue this career path?",
    "Question 2: Tell me about a time you had to resolve a serious technical or interpersonal disagreement within your team. How did you reach consensus?",
    "Question 3: Can you share an example of a project where requirements changed unexpectedly mid-flight? How did you adapt your plan and communicate with stakeholders?",
    "Question 4: Describe a situation where you had to lead a critical initiative under tight deadlines. How did you prioritize tasks and keep the team motivated?",
    "Question 5: Tell me about a significant mistake or oversight you made in a past project. What happened, how did you rectify it, and what did you learn?",
    "Question 6: How do you handle giving difficult constructive feedback to a peer or cross-functional partner while maintaining a positive working relationship?",
    "Question 7: Can you describe a scenario where you had to push back on unrealistic timelines from leadership to protect team health or code quality?",
    "Question 8: How do you maintain psychological safety and foster inclusive collaboration within engineering discussions?",
    "Question 9: Tell me about a time you mentored a junior or struggling team member to help them overcome technical hurdles.",
    "Question 10: To conclude, what leadership values do you believe are most critical for building high-performing engineering organizations?"
  ],
  "Full-Stack Developer": [
    "Question 1: Welcome! To get started with our interview, could you please introduce yourself, tell me about your professional background, and share an overview of your experience building web applications?",
    "Question 2: To begin our technical discussion: could you walk me through the architecture of a full-stack application you engineered from conception to production?",
    "Question 3: How do you approach designing API contracts and data models to ensure seamless synchronization between frontend UI state and backend databases?",
    "Question 4: Can you explain how you handle authentication, session persistence, and authorization across Next.js and backend microservices?",
    "Question 5: What strategies do you use to optimize performance on both the client (Core Web Vitals, bundle splitting) and the database query layer?",
    "Question 6: Describe a complex API integration you built. What trade-offs did you consider between REST, GraphQL, and WebSockets?",
    "Question 7: How do you approach automated testing across unit tests, API integration tests, and end-to-end flows?",
    "Question 8: How do you manage database migrations and schema changes in a live production environment without causing downtime?",
    "Question 9: Tell me about a challenging race condition or state synchronization bug you resolved in a distributed or multi-tenant system.",
    "Question 10: Finally, how do you balance the trade-offs between shipping features quickly versus paying down technical debt?"
  ],
  "Frontend Engineer": [
    "Question 1: Welcome! To get started with our interview, could you please introduce yourself, share an overview of your background, and highlight your experience with modern frontend technologies?",
    "Question 2: To start our technical discussion: could you describe a complex frontend application or interactive user interface you built, and the design decisions you made?",
    "Question 3: Can you explain the core differences between Server Components and Client Components in Next.js App Router, and when you choose each?",
    "Question 4: How do you structure large-scale React applications to prevent unnecessary re-renders, optimize tree shaking, and minimize bundle sizes?",
    "Question 5: Describe your approach to designing an accessible (WCAG compliant), responsive design system using CSS, Tailwind, or styled primitives.",
    "Question 6: How do you handle complex client-side state, cache invalidation, and optimistic UI updates when interacting with backend APIs?",
    "Question 7: What tooling and profiling techniques do you use to diagnose and fix Core Web Vitals issues such as Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS)?",
    "Question 8: How do you approach client-side error boundaries, fallback UI states, and telemetry logging for production runtime errors?",
    "Question 9: Can you explain your strategies for managing real-time data streaming (e.g., SSE, WebSockets) within React component lifecycles?",
    "Question 10: To wrap up, where do you see the future of frontend architecture heading with modern edge computing and AI-assisted interfaces?"
  ],
  "Backend Engineer": [
    "Question 1: Welcome! To get started with our interview, could you please introduce yourself, walk me through your background, and share an overview of your experience in backend engineering?",
    "Question 2: To begin our technical discussion: could you walk me through the backend architecture of a high-throughput service or API you engineered?",
    "Question 3: How do you design relational and non-relational database schemas for high-concurrency read/write operations while ensuring ACID properties?",
    "Question 4: Can you walk me through your experience building asynchronous event-driven pipelines using message brokers like Kafka, RabbitMQ, or SQS?",
    "Question 5: What caching strategies (e.g. Redis Cache-Aside, Write-Through, distributed caches) do you implement to reduce database load?",
    "Question 6: How do you monitor, trace, and correlate distributed requests across microservices using OpenTelemetry or distributed log aggregators?",
    "Question 7: Tell me about a severe performance bottleneck or memory leak you diagnosed in a backend service. What was the root cause and fix?",
    "Question 8: How do you implement robust circuit breaking, retry policies with exponential backoff, and graceful degradation under service outages?",
    "Question 9: How do you ensure idempotent request processing and prevent duplicate transaction charges in payment or financial workflows?",
    "Question 10: For our final question, what key metrics and SLIs/SLOs do you consider non-negotiable for enterprise backend reliability?"
  ],
  "AI / ML Engineer": [
    "Question 1: Welcome! To get started with our interview, could you please introduce yourself, share an overview of your background, and tell me about your experience working with AI, ML, or data systems?",
    "Question 2: To begin our technical discussion: could you describe an end-to-end Machine Learning or LLM project you designed and deployed to production?",
    "Question 3: Can you explain how you design and evaluate a Retrieval-Augmented Generation (RAG) pipeline for domain-specific enterprise knowledge?",
    "Question 4: What strategies and guardrails do you implement to minimize hallucination, latency, and token consumption in production LLM applications?",
    "Question 5: How do you choose between fine-tuning a foundation model (e.g. LoRA, QLoRA) versus few-shot prompt engineering and contextual retrieval?",
    "Question 6: What vector database indexing algorithms (e.g. HNSW, IVF) do you recommend for high-dimensional semantic search at scale?",
    "Question 7: How do you handle data preprocessing, chunking strategies, embeddings normalization, and hybrid semantic-plus-lexical search?",
    "Question 8: How do you detect and mitigate model drift, data distribution shifts, and adversarial prompt injections in deployed systems?",
    "Question 9: Describe your workflow for serving ML models with low latency using tools like Triton, vLLM, TensorRT-LLM, or FastAPI?",
    "Question 10: To conclude our session, how do you see autonomous multi-agent systems and reasoning models impacting software engineering?"
  ],
  "System Design Expert": [
    "Question 1: Welcome! To get started with our interview, could you please introduce yourself, walk me through your engineering journey, and share an overview of your experience architecting large-scale systems?",
    "Question 2: To start our technical architecture discussion: how do you approach scoping requirements and capacity planning when designing a planetary-scale distributed system?",
    "Question 3: How would you design a URL shortener like Bitly capable of handling 100M active daily users with high availability and low latency?",
    "Question 4: What architectural patterns would you use to design a globally distributed real-time messaging system (like Slack or WhatsApp)?",
    "Question 5: How do you handle database horizontal sharding, consistent hashing, and data rebalancing across distributed storage clusters?",
    "Question 6: How would you architect a distributed rate-limiting service (e.g. Token Bucket / Leaky Bucket) to protect microservices against DDoS abuse?",
    "Question 7: When designing distributed storage, how do you navigate the CAP theorem trade-offs between strong consistency and high availability?",
    "Question 8: How would you architect a video streaming and transcoding pipeline similar to YouTube or Netflix?",
    "Question 9: Describe how you would build a distributed search and indexing engine like Elasticsearch to ingest and query terabytes of logs daily?",
    "Question 10: To wrap up our interview, what core heuristics do you rely on when designing systems that must scale gracefully by 100x?"
  ]
};

export default function VoiceInterviewPage() {
  const router = useRouter();

  // Suppress known Vapi/Daily WebRTC transport disconnect errors from polluting the Next.js error overlay
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('send transport changed to disconnected') ||
         args[0].includes('recv transport changed to disconnected'))
      ) {
        return;
      }
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  // Candidate configuration
  const [candidateName, setCandidateName] = useState("Candidate");
  const [targetRole, setTargetRole] = useState("Behavioral & Leadership");
  const [interviewLevel, setInterviewLevel] = useState("Mid-Level Engineer");
  const [interviewType, setInterviewType] = useState("Voice AI Mock Interview");
  const [resumeSkills, setResumeSkills] = useState("");

  // Engine selection: Default to 'vapi' if key exists, otherwise 'browser'
  const [engineMode, setEngineMode] = useState<"browser" | "vapi">("vapi");

  // Call states
  const [isCalling, setIsCalling] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [copied, setCopied] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [dynamicQuestions, setDynamicQuestions] = useState<string[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // Live speech & typed answer inputs
  const [liveTranscript, setLiveTranscript] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);

  // Vapi API settings - Preloaded from environment variables
  const [showConfig, setShowConfig] = useState(false);
  const [vapiKey, setVapiKey] = useState(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "7544f573-7174-4a7c-abea-a201e231590a");
  const [assistantId, setAssistantId] = useState(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "83f75cc5-3440-4f4c-ab78-fa88ac3c5ca5");
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Transcripts & refs
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const vapiRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isCallEndedRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const autoFinishSafetyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechBufferRef = useRef<string>("");
  const speechSilenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const vapiUserBufferRef = useRef<string>("");
  const vapiUserTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser speech support and load preferences on mount
  useEffect(() => {
    const session = localStorage.getItem("ai_user_session");
    const config = localStorage.getItem("ai_interview_config");
    const savedKey = localStorage.getItem("vapi_public_key") || process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "7544f573-7174-4a7c-abea-a201e231590a";
    const savedAssistant = localStorage.getItem("vapi_assistant_id") || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "83f75cc5-3440-4f4c-ab78-fa88ac3c5ca5";
    const savedEngine = (localStorage.getItem("ai_voice_engine") as "browser" | "vapi") || "vapi";

    if (savedKey && !savedKey.includes("YOUR_")) setVapiKey(savedKey);
    if (savedAssistant && !savedAssistant.includes("YOUR_")) setAssistantId(savedAssistant);
    setEngineMode(savedEngine || "vapi");

    if (typeof window !== "undefined") {
      if ("speechSynthesis" in window) {
        synthRef.current = window.speechSynthesis;
      }
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) {
        setSpeechSupported(false);
      }
    }

    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const s = JSON.parse(session);
      if (s.name) setCandidateName(s.name);
    } catch {}

    if (config) {
      try {
        const c = JSON.parse(config);
        if (c.targetRole) setTargetRole(c.targetRole);
        if (c.interviewLevel) setInterviewLevel(c.interviewLevel);
        if (c.interviewType) setInterviewType(c.interviewType);
        if (c.resumeSkills) setResumeSkills(c.resumeSkills);
        if (c.userName) setCandidateName(c.userName);
      } catch {}
    }
  }, [router]);

  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const addMsg = (role: Message["role"], text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Safety merging for consecutive same-role messages (avoids fragmented single-word bubbles)
    const lastMsg = messagesRef.current[messagesRef.current.length - 1];
    if (lastMsg && lastMsg.role === role && role !== "system") {
      lastMsg.text = `${lastMsg.text} ${trimmed}`.trim();
      setMessages([...messagesRef.current]);
      return;
    }

    const newMsg: Message = { role, text: trimmed, ts: now() };
    messagesRef.current.push(newMsg);
    setMessages((prev) => [...prev, newMsg]);
  };

  // Welcome greeting
  useEffect(() => {
    if (candidateName) {
      setMessages([
        {
          role: "system",
          text: `Welcome ${candidateName}! You are configured for a "${interviewType}" session for ${targetRole} (${interviewLevel})${resumeSkills ? ` with focus on: ${resumeSkills}` : ""}. Click "Start Voice Interview Now" to begin.`,
          ts: now(),
        },
      ]);
    }
  }, [candidateName, targetRole, interviewLevel, interviewType, resumeSkills]);

  // Dynamically load tailored questions based on Target Role, Interview Level, and Resume Skills
  useEffect(() => {
    let isMounted = true;
    setIsGeneratingQuestions(true);

    const loadQuestions = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidate_name: candidateName,
            target_role: targetRole,
            interview_level: interviewLevel,
            resume_skills: resumeSkills,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
            if (isMounted) {
              setDynamicQuestions(data.questions);
              setIsGeneratingQuestions(false);
              return;
            }
          }
        }
      } catch (e) {
        console.warn("Backend question generator notice:", e);
      }

      if (isMounted) {
        const primary = resumeSkills ? resumeSkills.split(",")[0].trim() : targetRole;
        const introQ = `Question 1: Hello ${candidateName}! Welcome to your ${interviewLevel} interview for the ${targetRole} position. To get started, could you please introduce yourself, tell me about your background, and share an overview of your key skills and experience?`;
        const fallback = [
          introQ,
          `Question 2: To begin our technical discussion: based on your experience with ${primary}, what key architectural patterns and error handling strategies do you prioritize when building scalable systems?`,
          `Question 3: How do you structure data models and manage state consistency across service boundaries?`,
          `Question 4: Could you describe a challenging technical roadblock, concurrency issue, or system bottleneck you encountered, and how you resolved it?`,
          `Question 5: What caching and optimization strategies do you rely on to reduce latency under heavy load?`,
          `Question 6: How do you approach automated testing and continuous integration to guarantee software reliability?`,
          `Question 7: Can you share a situation where technical requirements or deadlines shifted unexpectedly? How did you adapt and communicate with your team?`,
          `Question 8: How do you handle constructive disagreement during architectural reviews with team members?`,
          `Question 9: Describe your workflow for diagnosing a high-severity production issue with minimal system downtime.`,
          `Question 10: To conclude our interview, what core engineering principles do you prioritize when building maintainable software for the long term?`
        ];
        setDynamicQuestions(fallback);
        setIsGeneratingQuestions(false);
      }
    };

    loadQuestions();

    return () => {
      isMounted = false;
    };
  }, [candidateName, targetRole, interviewLevel, resumeSkills]);

  // Auto scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTo({
        top: transcriptRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, liveTranscript]);

  // Call timer
  useEffect(() => {
    if (isCalling) {
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCalling]);

  // Setup Real Microphone Volume Analyzer
  const setupAudioAnalyzer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!mediaStreamRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(avg / 100, 1);
        if (normalized > 0.05) {
          setVolumeLevel(normalized);
        } else {
          setVolumeLevel(0);
        }
        requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      console.warn("Microphone stream error:", err);
    }
  };

  // -------------------------------------------------------------
  // Built-in Browser Voice Engine (Web Speech API)
  // -------------------------------------------------------------
  const speakWithBrowserVoice = (text: string, onEndCallback?: () => void) => {
    if (isCallEndedRef.current) return;
    if (!synthRef.current) {
      if (onEndCallback && !isCallEndedRef.current) onEndCallback();
      return;
    }

    try {
      synthRef.current.cancel();
    } catch {}

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    activeUtteranceRef.current = utterance;

    const voices = synthRef.current.getVoices();
    const englishVoice =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))
      ) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0];

    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => {
      if (isCallEndedRef.current) {
        try { synthRef.current?.cancel(); } catch {}
        activeUtteranceRef.current = null;
        return;
      }
      setIsSpeaking(true);
      setIsListening(false);
      setVolumeLevel(0.6);
    };

    utterance.onend = () => {
      activeUtteranceRef.current = null;
      setIsSpeaking(false);
      setVolumeLevel(0);
      if (isCallEndedRef.current) return;
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e: any) => {
      activeUtteranceRef.current = null;
      setIsSpeaking(false);
      setVolumeLevel(0);
      // If utterance was canceled or call ended, NEVER restart or execute callbacks
      if (isCallEndedRef.current || e.error === "canceled" || e.error === "interrupted") {
        return;
      }
      if (onEndCallback) onEndCallback();
    };

    if (!isCallEndedRef.current) {
      synthRef.current.speak(utterance);
    }
  };

  const startBrowserListening = () => {
    if (isCallEndedRef.current) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsListening(false);
      addMsg("system", "💡 Tip: Microphone speech-to-text is not supported in this browser. You can type your answer below or use Chrome/Edge.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        if (isCallEndedRef.current) {
          try { recognition.abort(); } catch {}
          return;
        }
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        if (isCallEndedRef.current) return;

        let interim = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += trans;
          } else {
            interim += trans;
          }
        }

        if (finalChunk.trim()) {
          speechBufferRef.current = (speechBufferRef.current + " " + finalChunk.trim()).trim();
        }

        const candidateSpoken = (speechBufferRef.current + " " + interim.trim()).trim();
        setLiveTranscript(candidateSpoken);

        // Early stop phrases detection
        const candidateSpokenLower = candidateSpoken.toLowerCase();
        const stopPhrases = [
          "end interview", "stop interview", "end the interview", "stop the interview",
          "finish the interview", "finish interview", "quit interview", "i am done",
          "i'm done", "wrap up now", "let's stop", "let's end", "exit interview", "please end",
          "finish"
        ];
        if (stopPhrases.some((p) => candidateSpokenLower.includes(p))) {
          if (speechSilenceTimerRef.current) {
            clearTimeout(speechSilenceTimerRef.current);
            speechSilenceTimerRef.current = null;
          }
          speechBufferRef.current = "";
          setLiveTranscript("");
          addMsg("user", candidateSpoken || "End interview");
          addMsg("system", "🛑 Candidate requested to conclude the interview. Wrapping up session now...");
          handleEnd();
          return;
        }

        // Reset silence debounce timer: Wait 2.8 seconds of continuous silence before sending!
        if (speechSilenceTimerRef.current) {
          clearTimeout(speechSilenceTimerRef.current);
          speechSilenceTimerRef.current = null;
        }

        // Only start the silence countdown if the candidate has actually spoken words
        if (speechBufferRef.current.trim().length > 0) {
          speechSilenceTimerRef.current = setTimeout(() => {
            if (isCallEndedRef.current) return;
            const completeAnswer = speechBufferRef.current.trim();
            if (completeAnswer.length > 0) {
              speechBufferRef.current = "";
              setLiveTranscript("");
              addMsg("user", completeAnswer);
              processCandidateAnswer(completeAnswer);
            }
          }, 2800);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition notice:", e.error);
        if (e.error === "network" || e.error === "not-allowed" || e.error === "service-not-allowed") {
          setIsListening(false);
          addMsg("system", "🎙️ Mic Note: If your browser blocks Speech Services, you can speak and also click 'Submit Answer' or type your response in the box below!");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (isCallEndedRef.current) return;

        // Keep speech recognition actively listening across candidate pauses/breaths
        // until the silence timer explicitly finalizes the answer or candidate submits
        if (!isSpeaking && isCalling) {
          try {
            recognition.start();
            setIsListening(true);
          } catch {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
    }
  };

  // Submit Answer (from Speech or Typed input)
  const submitManualAnswer = (customText?: string) => {
    if (speechSilenceTimerRef.current) {
      clearTimeout(speechSilenceTimerRef.current);
      speechSilenceTimerRef.current = null;
    }
    const ans = customText || typedAnswer || speechBufferRef.current || liveTranscript;
    speechBufferRef.current = "";
    setLiveTranscript("");
    setTypedAnswer("");
    if (!ans || !ans.trim()) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    addMsg("user", ans.trim());
    processCandidateAnswer(ans.trim());
  };

  const processCandidateAnswer = async (candidateAnswer: string) => {
    if (isCallEndedRef.current) return;
    setIsListening(false);
    setIsSpeaking(false);

    // Check if candidate wants to end early through typed or submitted text
    const textLower = candidateAnswer.toLowerCase();
    const stopPhrases = [
      "end interview", "stop interview", "end the interview", "stop the interview",
      "finish the interview", "finish interview", "quit interview", "i am done",
      "i'm done", "wrap up now", "let's stop", "let's end", "exit interview"
    ];
    if (stopPhrases.some((p) => textLower.includes(p))) {
      addMsg("system", "🛑 Candidate requested to conclude the interview. Generating evaluation...");
      handleEnd();
      return;
    }

    const questionsToAsk = dynamicQuestions.length > 0
      ? dynamicQuestions
      : (ROLE_QUESTIONS[targetRole] || ROLE_QUESTIONS["Behavioral & Leadership"]);
    const currentQ = questionsToAsk[questionIndex] || "Tell me about your technical background and experience.";
    const currentTurn = questionIndex + 1;

    // Abort controller to cancel request if user ends mid-flight
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          candidate_name: candidateName,
          target_role: targetRole,
          interview_level: interviewLevel,
          resume_skills: resumeSkills,
          current_question: currentQ,
          candidate_answer: candidateAnswer,
          turn_index: currentTurn,
        }),
      });

      if (isCallEndedRef.current) return;

      if (res.ok) {
        const data = await res.json();
        if (isCallEndedRef.current) return;

        const isFinished = !!data.is_finished;
        const speech = data.combined_speech || (isFinished
          ? `Outstanding job ${candidateName}! That concludes our interview session today. Your comprehensive performance evaluation scorecard is now being prepared!`
          : `${data.acknowledgement} ${data.next_question}`);

        if (isFinished) {
          // Automatic interview completion decided by AI interviewer
          setQuestionIndex(currentTurn - 1);
          addMsg("assistant", speech);

          // Speak wrap up and automatically transition to evaluation
          speakWithBrowserVoice(speech, () => {
            handleAutoFinish();
          });

          // Safety timeout: Ensure transition occurs even if speech synthesis stalls
          const maxSpeechMs = Math.min(Math.max(speech.length * 70, 4000), 9000);
          autoFinishSafetyTimerRef.current = setTimeout(() => {
            handleAutoFinish();
          }, maxSpeechMs);
          return;
        }

        // Advance to next question decided dynamically by AI
        if (data.next_question) {
          setDynamicQuestions((prev) => {
            const copy = [...prev];
            copy[currentTurn] = data.next_question;
            return copy;
          });
        }

        setQuestionIndex(currentTurn);
        addMsg("assistant", speech);

        speakWithBrowserVoice(speech, () => {
          if (isCallEndedRef.current) return;
          startBrowserListening();
        });
        return;
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.warn("AI chat-turn notice (using fallback flow):", err);
    }

    if (isCallEndedRef.current) return;

    // Fallback flow if network drops or errors
    pendingTimeoutRef.current = setTimeout(() => {
      if (isCallEndedRef.current) return;
      if (currentTurn < questionsToAsk.length) {
        setQuestionIndex(currentTurn);
        const nextQNum = currentTurn + 1;
        const rawQ = questionsToAsk[currentTurn] || "Can you discuss another challenging technical trade-off you solved?";
        const nextQ = rawQ.startsWith("Question") ? rawQ : `Question ${nextQNum}: ${rawQ}`;
        const combined = `Understood, good points on that approach. ${nextQ}`;
        addMsg("assistant", combined);
        speakWithBrowserVoice(combined, () => {
          if (!isCallEndedRef.current) {
            startBrowserListening();
          }
        });
      } else {
        const wrapUp = `Thank you ${candidateName}! That concludes our interview session today. You demonstrated solid technical communication for a ${interviewLevel} ${targetRole}. Generating your scorecard now!`;
        addMsg("assistant", wrapUp);
        speakWithBrowserVoice(wrapUp, () => {
          handleAutoFinish();
        });
        autoFinishSafetyTimerRef.current = setTimeout(() => {
          handleAutoFinish();
        }, 6000);
      }
    }, 500);
  };

  // -------------------------------------------------------------
  // Start Voice Interview Flow
  // -------------------------------------------------------------
  const handleStart = async () => {
    isCallEndedRef.current = false;
    setIsConnecting(true);
    await setupAudioAnalyzer();

    // Vapi Cloud Engine
    if (engineMode === "vapi") {
      if (!vapiKey || vapiKey.includes("YOUR_")) {
        setIsConnecting(false);
        addMsg("system", "⚠️ Cannot start Vapi: Please enter your Vapi Public Key in the Voice Engine settings first.");
        return;
      }
      
      addMsg("system", `Connecting to Vapi Cloud Voice Engine for ${targetRole}...`);
      try {
        const vapi = getVapi(vapiKey);
        vapiRef.current = vapi;

        vapi.on("call-start", () => {
          if (isCallEndedRef.current) return;
          setIsConnecting(false);
          setIsCalling(true);
          addMsg("system", "Voice AI Interview session initiated via Vapi! Listening...");
        });

        vapi.on("call-end", () => {
          setIsCalling(false);
          setIsConnecting(false);
          setIsSpeaking(false);
          setVolumeLevel(0);
          addMsg("system", "Interview session completed.");
          if (!isCallEndedRef.current) {
            handleAutoFinish();
          }
        });

        const flushVapiUser = () => {
          if (vapiUserTimerRef.current) {
            clearTimeout(vapiUserTimerRef.current);
            vapiUserTimerRef.current = null;
          }
          const text = vapiUserBufferRef.current.trim();
          if (text) {
            vapiUserBufferRef.current = "";
            setLiveTranscript("");
            addMsg("user", text);
          }
        };

        vapi.on("speech-start", () => {
          if (isCallEndedRef.current) return;
          flushVapiUser();
          setIsSpeaking(true);
        });
        vapi.on("speech-end", () => {
          setIsSpeaking(false);
        });
        vapi.on("volume-level", (v: number) => {
          if (isCallEndedRef.current) return;
          setVolumeLevel(v);
        });
        vapi.on("message", (msg: any) => {
          if (isCallEndedRef.current) return;
          if (msg?.type === "transcript") {
            const role = msg?.role === "assistant" ? "assistant" : "user";
            const text = (msg.transcript || "").trim();
            if (!text) return;

            if (role === "assistant") {
              flushVapiUser();
              if (msg.transcriptType === "final") {
                addMsg("assistant", text);

                // Dynamically update question counter & progress in Vapi mode
                const match = text.match(/Question\s+(\d+)/i);
                if (match) {
                  const qNum = parseInt(match[1], 10);
                  if (!isNaN(qNum) && qNum >= 1) {
                    setQuestionIndex(qNum - 1);
                  }
                }

                const textLower = text.toLowerCase();
                // Automatically detect conclusion or stop command in Vapi
                if (
                  textLower.includes("conclude our interview") ||
                  textLower.includes("that concludes our interview") ||
                  textLower.includes("that concludes our session") ||
                  textLower.includes("concludes our interview session") ||
                  textLower.includes("scorecard is being generated") ||
                  textLower.includes("scorecard is being prepared")
                ) {
                  setTimeout(() => {
                    if (!isCallEndedRef.current) {
                      handleEnd();
                    }
                  }, 2500);
                }
              }
            } else {
              // Candidate speech in Vapi mode
              if (msg.transcriptType === "final") {
                vapiUserBufferRef.current = (vapiUserBufferRef.current + " " + text).trim();
                setLiveTranscript(vapiUserBufferRef.current);

                const candidateSpokenLower = vapiUserBufferRef.current.toLowerCase();
                if (
                  candidateSpokenLower.includes("end interview") ||
                  candidateSpokenLower.includes("stop interview") ||
                  candidateSpokenLower.includes("finish interview") ||
                  candidateSpokenLower.includes("end the interview") ||
                  candidateSpokenLower.includes("quit interview") ||
                  candidateSpokenLower.includes("finish")
                ) {
                  flushVapiUser();
                  handleEnd();
                  return;
                }

                // Debounce silence timer for Vapi candidate speech:
                // Wait 2.2 seconds of silence before finalizing into candidate bubble
                if (vapiUserTimerRef.current) {
                  clearTimeout(vapiUserTimerRef.current);
                }
                vapiUserTimerRef.current = setTimeout(() => {
                  flushVapiUser();
                }, 2200);
              } else {
                setLiveTranscript((vapiUserBufferRef.current + " " + text).trim());
              }
            }
          }
        });
        vapi.on("error", (e: any) => {
          console.warn("Vapi error event notice:", e);
          setIsConnecting(false);
          setIsCalling(false);
          addMsg("system", `Vapi Error: ${e?.message || "Connection failed. Please check your Vapi Public Key."}`);
        });

        const systemPrompt = `You are a Principal Technical Interviewer conducting an authentic, conversational ${interviewLevel} interview for ${candidateName} applying for a ${targetRole} role.
Candidate Resume Skills & Technologies: ${resumeSkills || "Software Engineering, Core Development"}.

Core Directives:
1. ALWAYS ASK INTRODUCTION FIRST: Question 1 MUST ALWAYS BE THE CANDIDATE'S INTRODUCTION. You must start the session by asking the candidate to introduce themselves, walk through their background, and share an overview of their experience. Under NO circumstances should Question 1 ask technical problem-solving or coding questions.
2. STARTING THE TECHNICAL INTERVIEW: Only AFTER the candidate has responded to Question 1 with their introduction, proceed to Question 2 to begin the technical interview questions matching the ${targetRole} role and ${interviewLevel} standard.
3. CONVERSATIONAL AUTONOMY (NO 10-QUESTION LIMIT): There is NO rigid limit of 10 questions. You have total autonomy to ask whatever questions, scenario deep-dives, or follow-ups you feel are needed to assess the candidate's skills and thought process.
4. CONCLUDING THE INTERVIEW: When you feel you have gathered sufficient signals across their background, problem-solving, and practical technical depth, naturally conclude the interview by saying: "Thank you ${candidateName}! That concludes our interview session today. Your comprehensive evaluation scorecard is now being prepared!" and end the call.
5. EARLY TERMINATION: If the candidate says "end interview", "stop interview", "finish", or wants to exit, STOP ASKING QUESTIONS immediately and say: "Understood, ending the interview now. Thank you!"
6. ACTIVE LISTENING: React directly to specific technical tools, patterns, and trade-offs the candidate mentions before advancing. Prefix questions cleanly with "Question X: ...".
7. Standard: Calibrate your technical depth strictly to a ${interviewLevel} standard for the ${targetRole} position.`;

        const introQ = `Question 1: Hello ${candidateName}! Welcome to your ${interviewLevel} interview for the ${targetRole} position. To get started, could you please introduce yourself, tell me about your background, and share an overview of your key skills and experience?`;

        let tailoredFirstMessage = introQ;
        if (dynamicQuestions.length > 0 && dynamicQuestions[0]) {
          const firstCandidateQ = dynamicQuestions[0];
          if (firstCandidateQ.toLowerCase().includes("introduce") || firstCandidateQ.toLowerCase().includes("introduction") || firstCandidateQ.toLowerCase().includes("background")) {
            tailoredFirstMessage = firstCandidateQ;
          }
        }

        const assistantOverrides: any = {
          firstMessage: tailoredFirstMessage,
          model: {
            provider: "openai" as const,
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system" as const,
                content: systemPrompt,
              },
            ],
          },
          startSpeakingPlan: {
            waitSeconds: 2.2,
          },
          variableValues: {
            candidateName,
            targetRole,
            interviewLevel,
            resumeSkills,
          },
        };

        if (assistantId && !assistantId.includes("YOUR_")) {
          await vapi.start(assistantId, assistantOverrides);
        } else {
          const vapiConfig: any = {
            name: "AI Technical Interviewer",
            firstMessage: tailoredFirstMessage,
            model: assistantOverrides.model,
            startSpeakingPlan: assistantOverrides.startSpeakingPlan,
            voice: { provider: "11labs" as const, voiceId: "paula" },
          };
          await vapi.start(vapiConfig);
        }
        return;
      } catch (err: any) {
        console.warn("Vapi connection failed:", err);
        setIsConnecting(false);
        addMsg("system", `⚠️ Vapi initialization failed: ${err.message}`);
        return;
      }
    }

    // Built-in Browser Voice Engine
    try {
      setIsConnecting(false);
      setIsCalling(true);
      setQuestionIndex(0);

      const questionsToAsk = dynamicQuestions.length > 0
        ? dynamicQuestions
        : (ROLE_QUESTIONS[targetRole] || ROLE_QUESTIONS["Behavioral & Leadership"]);

      let firstQ = questionsToAsk[0];
      if (!firstQ || (!firstQ.toLowerCase().includes("introduce") && !firstQ.toLowerCase().includes("background"))) {
        firstQ = `Question 1: Hello ${candidateName}! Welcome to your ${interviewLevel} interview for the ${targetRole} position. To get started, could you please introduce yourself, tell me about your background, and share an overview of your key skills and experience?`;
      }

      addMsg("system", `🎙️ Voice AI Interview started (${interviewLevel} · ${targetRole} · Adaptive Session). Question 1!`);
      addMsg("assistant", firstQ);

      speakWithBrowserVoice(firstQ, () => {
        if (!isCallEndedRef.current) {
          startBrowserListening();
        }
      });
    } catch (err: any) {
      setIsConnecting(false);
      setIsCalling(false);
      addMsg("system", `Voice initialization error: ${err.message}`);
    }
  };

  // Called when all 10 questions are completed automatically
  const handleAutoFinish = () => {
    if (isCallEndedRef.current) return;
    isCallEndedRef.current = true;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
    if (autoFinishSafetyTimerRef.current) {
      clearTimeout(autoFinishSafetyTimerRef.current);
      autoFinishSafetyTimerRef.current = null;
    }
    if (speechSilenceTimerRef.current) {
      clearTimeout(speechSilenceTimerRef.current);
      speechSilenceTimerRef.current = null;
    }
    if (vapiUserTimerRef.current) {
      clearTimeout(vapiUserTimerRef.current);
      vapiUserTimerRef.current = null;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    activeUtteranceRef.current = null;

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }

    if (vapiRef.current) {
      try { vapiRef.current.stop(); } catch {}
      vapiRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsCalling(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    setIsListening(false);
    setVolumeLevel(0);

    addMsg("system", "🎉 All 10 questions answered! Finalizing your AI performance evaluation scorecard...");
    completeAndEvaluate();
  };

  // Called immediately when candidate clicks "End Interview" or requests early stop
  const handleEnd = () => {
    if (isCallEndedRef.current) return;
    isCallEndedRef.current = true;

    // 1. Immediately abort active network fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // 2. Clear all scheduled timeouts
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
    if (autoFinishSafetyTimerRef.current) {
      clearTimeout(autoFinishSafetyTimerRef.current);
      autoFinishSafetyTimerRef.current = null;
    }
    if (speechSilenceTimerRef.current) {
      clearTimeout(speechSilenceTimerRef.current);
      speechSilenceTimerRef.current = null;
    }
    if (vapiUserTimerRef.current) {
      clearTimeout(vapiUserTimerRef.current);
      vapiUserTimerRef.current = null;
    }

    // 3. Immediately silence browser speech synthesis
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    activeUtteranceRef.current = null;

    // 4. Abort speech recognition immediately
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    // 5. Stop all media stream audio tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }

    // 6. Force terminate Vapi cloud call
    if (vapiRef.current) {
      try {
        vapiRef.current.stop();
      } catch {}
      vapiRef.current = null;
    }

    // 7. Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsCalling(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    setIsListening(false);
    setVolumeLevel(0);

    addMsg("system", "🛑 Interview ended. Finalizing your AI evaluation scorecard...");
    completeAndEvaluate();
  };

  const completeAndEvaluate = async () => {
    setIsEvaluating(true);
    addMsg("system", "Saving interview transcript and generating AI evaluation...");
    
    try {
      const sessionStr = localStorage.getItem("ai_user_session");
      const userEmail = sessionStr ? JSON.parse(sessionStr).email : "candidate@example.com";
      const fullTranscript = messagesRef.current.length > 0 ? messagesRef.current : messages;
      
      console.log(`Saving interview transcript (${fullTranscript.length} messages) to MongoDB...`);

      // 1. Save Transcript
      const saveRes = await fetch("http://127.0.0.1:8000/api/save-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: userEmail,
          user_name: candidateName,
          target_role: targetRole,
          interview_level: interviewLevel,
          messages: fullTranscript.map(m => ({ role: m.role, text: m.text, ts: m.ts }))
        })
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.detail || "Failed to save transcript");
      
      const transcriptId = saveData.transcript_id;
      console.log("Transcript successfully stored in MongoDB. ID:", transcriptId);
      
      // 2. Evaluate Transcript
      console.log("Calling evaluation endpoint for transcript:", transcriptId);
      const evalRes = await fetch(`http://127.0.0.1:8000/api/evaluate-transcript/${transcriptId}`, {
        method: "POST"
      });
      if (!evalRes.ok) throw new Error("Failed to evaluate transcript");
      console.log("Evaluation generated and stored successfully!");
      
      // 3. Redirect
      router.push(`/result/${transcriptId}`);
    } catch (err: any) {
      console.error("Evaluation or save error:", err);
      addMsg("system", `Evaluation Error: ${err.message}`);
      setIsEvaluating(false);
    }
  };

  const handleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (next) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      setIsListening(false);
    } else {
      if (!isSpeaking) {
        startBrowserListening();
      }
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem("vapi_public_key", vapiKey.trim());
    localStorage.setItem("vapi_assistant_id", assistantId.trim());
    localStorage.setItem("ai_voice_engine", engineMode);
    setShowConfig(false);
    addMsg(
      "system",
      `Voice Engine switched to: ${
        engineMode === "browser" ? "Built-in Browser Voice AI (Free)" : "Vapi Cloud Voice AI"
      }`
    );
  };

  const handleCopyTranscript = () => {
    const text = messages
      .map(
        (m) =>
          `[${m.ts}] ${
            m.role === "user" ? candidateName : m.role === "assistant" ? "AI Interviewer" : "System"
          }: ${m.text}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <main className="h-screen bg-slate-50 text-slate-800 flex flex-col relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
          isCalling
            ? isSpeaking
              ? "bg-purple-200/40 scale-110"
              : isListening
              ? "bg-emerald-200/35 scale-105"
              : "bg-indigo-200/30"
            : "bg-indigo-100/20"
        }`}
      />

      {/* ── Topbar ── */}
      <header className="relative z-10 border-b border-slate-200 bg-white/90 backdrop-blur-xl px-5 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all border border-slate-200 cursor-pointer"
            title="Back to Dashboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">AI Voice Interview Room</h1>
              <p className="text-[10px] text-slate-500">
                {candidateName} · {targetRole} · {interviewLevel}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Active Voice Engine Badge */}
          <span className="hidden sm:inline-flex text-[11px] px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            {engineMode === "browser" ? "Built-in Voice AI (Free)" : "Vapi Cloud AI"}
          </span>

          {/* Live Call Duration */}
          {isCalling && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 font-mono text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>LIVE {fmt(callDuration)}</span>
            </div>
          )}

          {/* Voice Settings Button */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 text-xs flex items-center gap-1.5 transition-all font-medium cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Voice Engine</span>
          </button>
        </div>
      </header>

      {/* ── Voice Settings Modal ── */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-4 max-w-md w-full animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span><svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg></span> Choose Voice AI Engine
              </p>
              <button
                onClick={() => setShowConfig(false)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Engine Selector */}
            <div className="space-y-2.5">
              <label
                onClick={() => setEngineMode("browser")}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  engineMode === "browser"
                    ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200"
                    : "bg-slate-50 border-slate-200 hover:bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="engine"
                  checked={engineMode === "browser"}
                  onChange={() => setEngineMode("browser")}
                  className="mt-1 accent-indigo-600"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    Built-in Browser Voice AI
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                      Instant & Free
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Uses browser speech synthesis & microphone. Works immediately without any API keys or paid accounts!
                  </p>
                </div>
              </label>

              <label
                onClick={() => setEngineMode("vapi")}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  engineMode === "vapi"
                    ? "bg-purple-50 border-purple-300 ring-2 ring-purple-200"
                    : "bg-slate-50 border-slate-200 hover:bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="engine"
                  checked={engineMode === "vapi"}
                  onChange={() => setEngineMode("vapi")}
                  className="mt-1 accent-purple-600"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    Vapi Cloud Voice AI
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                      Cloud Latency
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Ultra-low latency conversational AI streamed from Vapi cloud. Requires your Vapi Public Key.
                  </p>
                </div>
              </label>
            </div>

            {/* Vapi Credentials fields if Vapi is selected */}
            {engineMode === "vapi" && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-500 mb-1 font-semibold uppercase tracking-wider">
                    Vapi Public Key
                  </p>
                  <input
                    type="password"
                    value={vapiKey}
                    onChange={(e) => setVapiKey(e.target.value)}
                    placeholder="Enter your Vapi Public Key (UUID)..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-1 font-semibold uppercase tracking-wider">
                    Assistant ID (Optional)
                  </p>
                  <input
                    type="text"
                    value={assistantId}
                    onChange={(e) => setAssistantId(e.target.value)}
                    placeholder="Enter Assistant ID if created in Vapi..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleSaveSettings}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Save Engine Preferences
            </button>
          </div>
        </div>
      )}

      {/* ── Evaluating Overlay ── */}
      {isEvaluating && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="flex flex-col items-center max-w-sm text-center bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-xl shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center mb-4 shadow-sm">
               <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
               </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Analyzing Performance</h2>
            <p className="text-indigo-200 text-xs mb-4">AI is evaluating your communication, technical competence, and generating your scorecard...</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-xs px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium transition-all cursor-pointer"
            >
              Skip to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ── Main Layout Grid ── */}
      <div className="relative z-10 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-5 max-w-7xl mx-auto w-full overflow-hidden">
        
        {/* ── LEFT: Voice Visualizer & Controls ── */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-white/90 border border-slate-200 backdrop-blur-xl shadow-md h-full overflow-y-auto">
          
          {/* Header Status */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-semibold">
              <span
                className={`w-2 h-2 rounded-full ${
                  isCalling
                    ? isSpeaking
                      ? "bg-purple-500 animate-pulse"
                      : isListening
                      ? "bg-emerald-500 animate-ping"
                      : "bg-indigo-500"
                    : isConnecting
                    ? "bg-amber-500 animate-ping"
                    : "bg-slate-400"
                }`}
              />
              <span className="text-slate-700 font-medium">
                {isConnecting
                  ? "Connecting Voice Engine..."
                  : isCalling
                  ? isSpeaking
                    ? "AI Interviewer Speaking..."
                    : isListening
                    ? (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                        Listening to you now...
                      </span>
                    )
                    : "Listening for your response..."
                  : "Ready to Start Interview"}
              </span>
            </div>
          </div>

          {/* Candidate Context & Personalization Banner */}
          <div className="w-full mt-3 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-left">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                <span>🎯</span> Interview Personalization
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-800 font-semibold">
                {interviewLevel}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-800">
              Role: <span className="text-indigo-600">{targetRole}</span>
            </p>
            {resumeSkills && (
              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                <span className="font-semibold text-slate-700">Resume Skills:</span> {resumeSkills}
              </p>
            )}
            {isGeneratingQuestions ? (
              <p className="text-[10px] text-indigo-500 mt-1.5 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping inline-block" />
                Crafting tailored questions from your resume...
              </p>
            ) : dynamicQuestions.length > 0 ? (
              <p className="text-[10px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                <span>✓</span> Adaptive AI questions ready
              </p>
            ) : null}
          </div>



          {/* Concentric Pulsing Mic Visualizer */}
          <div className="relative flex items-center justify-center my-6">
            {isCalling && (
              <>
              </>
            )}
            
            <div
              className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                isCalling
                  ? isSpeaking
                    ? "bg-indigo-600 scale-105"
                    : isListening
                    ? "bg-indigo-500 scale-105"
                    : "bg-indigo-500"
                  : "bg-slate-200 border border-slate-300"
              }`}
            >
              <svg className={`w-12 h-12 ${isCalling ? "text-white" : "text-slate-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>



          {/* Interview Instructions (Only show before starting) */}
          {!isCalling && (
            <div className="w-full bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Interview Instructions
              </h3>
              <ul className="text-xs text-slate-600 space-y-1.5 ml-1">
                <li className="flex items-start gap-1.5"><span className="text-indigo-400">•</span> Use headphones/earphones for better audio quality</li>
                <li className="flex items-start gap-1.5"><span className="text-indigo-400">•</span> Sit in a quiet, noise-free environment</li>
                <li className="flex items-start gap-1.5"><span className="text-indigo-400">•</span> Check that your microphone is working properly</li>
                <li className="flex items-start gap-1.5"><span className="text-indigo-400">•</span> Speak clearly and at a comfortable pace</li>
                <li className="flex items-start gap-1.5"><span className="text-indigo-400">•</span> Ensure a stable internet connection</li>
                <li className="flex items-start gap-1.5"><span className="text-indigo-400">•</span> Minimize background distractions and notifications</li>
              </ul>
            </div>
          )}

          {/* Action Control Buttons */}
          <div className="w-full flex flex-col items-center gap-3">
            {!isCalling ? (
              <button
                onClick={handleStart}
                disabled={isConnecting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
              >
                {isConnecting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Connecting Voice Engine...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span>Start Voice Interview Now</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5 w-full justify-center">


                <button
                  onClick={handleMute}
                  className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer ${
                    isMuted
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        isMuted
                          ? "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      }
                    />
                  </svg>
                  <span>{isMuted ? "Unmute Mic" : "Mute Mic"}</span>
                </button>

                <button
                  onClick={handleEnd}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                  </svg>
                  <span>End Interview</span>
                </button>
              </div>
            )}

            {/* Target Role Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
              {[targetRole, interviewType, interviewLevel].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Real-Time Conversation Transcript & Input Bar ── */}
        <div className="lg:col-span-7 flex flex-col rounded-3xl bg-white/90 border border-slate-200 backdrop-blur-xl shadow-md h-[520px] lg:h-full min-h-0 overflow-hidden">
          {/* Transcript Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Live Conversation Transcript
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {isCalling && (
                <span className="text-[10px] text-emerald-600 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE AUDIO
                </span>
              )}
              {messages.length > 1 && (
                <button
                  onClick={handleCopyTranscript}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium border border-slate-200 transition-all cursor-pointer"
                >
                  {copied ? "✓ Copied" : "Copy Transcript"}
                </button>
              )}
            </div>
          </div>

          {/* Transcript Messages Feed */}
          <div ref={transcriptRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.role === "user"
                    ? "items-end"
                    : msg.role === "assistant"
                    ? "items-start"
                    : "items-center"
                }`}
              >
                {msg.role === "system" ? (
                  <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 max-w-[90%] text-center shadow-sm">
                    {msg.text}
                  </div>
                ) : (
                  <div className="max-w-[85%]">
                    <div
                      className={`flex items-center gap-1.5 mb-1 px-1 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-600">
                        {msg.role === "user" ? candidateName : "AI Interviewer"}
                      </span>
                      <span className="text-[9px] text-slate-400">• {msg.ts}</span>
                    </div>

                    <div
                      className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                          : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-200 shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Live Typing/Speech Interim Bubble */}
            {liveTranscript && (
              <div className="flex flex-col items-end">
                <div className="text-[10px] font-bold text-indigo-600 mb-1 px-1">{candidateName} (Speaking...)</div>
                <div className="px-4 py-3 rounded-2xl rounded-tr-none bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs italic">
                  {liveTranscript}
                </div>
              </div>
            )}

            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center h-full text-center p-6 text-slate-400 space-y-2">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <p className="text-xs">Live transcription of spoken questions and candidate responses will appear here.</p>
              </div>
            )}
          </div>

          {/* ── Optional Quick Answer Input Bar ── */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/80 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitManualAnswer();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type your answer or speak into microphone..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
              <button
                type="submit"
                disabled={!typedAnswer.trim() && !liveTranscript}
                className="px-4 py-2.5 rounded-xl bg-indigo-400 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
              >
                <span>Submit Answer</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-3 text-[10px] text-slate-400 border-t border-slate-200">
        Enterprise AI Mock Interview Engine · Multi-Mode Voice Simulation Platform
      </footer>
    </main>
  );
}
