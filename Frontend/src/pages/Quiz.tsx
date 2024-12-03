import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePdf } from '../context/PdfContext';
import { motion } from 'framer-motion';
import { quizService } from '../services/api';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const Quiz: React.FC = () => {
  const { setScore,setFinalScore, pdfText ,setQuiz, setAnsArr} = usePdf();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state
if(!pdfText){
  alert('no pdf uploaded')
  navigate('/')
}
  
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizService.generateQuiz(pdfText);
        setQuestions(response); 
        setQuiz(response);
        setLoading(false); 
      } catch (err) {
        setError("Failed to load quiz. Please try again.");
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [pdfText]);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
     setAnswers(newAnswers);

    // console.log(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const finalScore = calculateScore();
      setScore(finalScore);
      // console.log(finalScore)
     
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return score + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);
  };

  const handleFinish = () => {
    setFinalScore((calculateScore()/(questions.length))*100)
     setAnsArr(answers)
    navigate('/scorecard');
  };

  // Show loading indicator or error message
  if (loading) {
    return <div className='flex h-screen w-full justify-center items-center text-3xl font-bold'>Loading quiz...</div>;
  }

  if (error) {
    return <div className='flex h-screen w-full justify-center items-center text-3xl font-bold'>{error}</div>;
  }
  else{
  // Show quiz results
  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Complete!</h2>
          <p className="text-xl text-gray-600 mb-8">
            You scored {calculateScore()} out of {questions.length}
          </p>
          <button
            onClick={handleFinish}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View Detailed Results
          </button>
        </motion.div>
      </div>
    );
  }

  // Render the quiz
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Question {currentQuestion + 1} of {questions.length}
            </h2>
            <span className="text-sm text-gray-500">
              Progress: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl text-gray-800 mb-4">
            {questions[currentQuestion].question}
          </h3>
          <div className="space-y-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full text-left p-4 rounded-lg border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
}

export default Quiz;
