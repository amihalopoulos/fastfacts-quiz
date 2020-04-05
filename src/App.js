/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useParams
} from 'react-router-dom';

export default function ParamsExample() {
  return (
    <Router>
      <div>
        <h2>Fast Facts</h2>

        <Switch>
          <Route path='/create/:id' component={CreateQuestions} />
          <Route path='/create' children={<CreateQuiz />} />
          <Route path='/:id' component={Quiz} />
        </Switch>
      </div>
    </Router>
  );
}

const CreateQuestions = props => {
  // console.log(props && props.location ? props.location.state.episode : '');
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(false);
  const [error, setError] = useState('');
  const episodeId = props.match.params.id;

  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await fetch(
        `https://verrc13mxk.execute-api.us-west-2.amazonaws.com/dev/episodes/${episodeId}/questions`
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      const body = await response.json();
      if (body.message === 'Success') {
        console.log(body);
        setQuestions(body.data);
      }
    };

    fetchQuestions();
  }, []);

  const selectAnswer = e => {
    setAnswer(e.target.value);
  };

  const updateQuestion = e => {
    setQuestion(e.target.value);
  };

  const submitQuestion = async () => {
    const response = await fetch(
      'https://verrc13mxk.execute-api.us-west-2.amazonaws.com/dev/questions',
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: question,
          answer: answer,
          episode: episodeId
        })
      }
    );

    if (response.error) {
      setError(response.error);
      return;
    }

    const body = await response.json();
    if (body.message === 'Success') {
      setQuestions([...questions, body.data]);
      setQuestion('');
      setAnswer('');
      setError('');
      return;
    }
  };

  return (
    <div>
      <h1>Let's make questions</h1>
      <div>{error}</div>
      <h2>Questions</h2>
      <ol>
        {questions.map(q => (
          <li>
            <span>{q.question}</span>
            <span>
              {' '}
              --{' '}
              {`${
                q.answer === true || q.answer === false
                  ? q.answer
                  : 'answer hidden'
              }`}
            </span>
          </li>
        ))}
      </ol>
      <div>
        <h2>Add Question</h2>
        <input
          placeholder='True/False Question'
          value={question}
          onChange={updateQuestion}
        />
        <select value={answer} onChange={selectAnswer}>
          <option value={true}>True</option>
          <option value={false}>False</option>
        </select>
      </div>

      <div>
        <button onClick={submitQuestion}>Submit</button>
      </div>
    </div>
  );
};

function CreateQuiz() {
  // We can use the `useParams` hook here to access
  // the dynamic pieces of the URL.
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [episode, setEpisode] = useState('');
  const [success, setSuccess] = useState(false);

  const handleTitle = e => {
    setTitle(e.target.value);
  };

  const handleDescription = e => {
    setDescription(e.target.value);
  };

  const submitEpisode = async () => {
    setError('');
    const response = await fetch(
      'https://verrc13mxk.execute-api.us-west-2.amazonaws.com/dev/episodes',
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          description: description
        })
      }
    );

    if (response.error) {
      setError(response.error);
      return;
    }

    const body = await response.json();
    if (body.message === 'Success') {
      setEpisode(body.data);
      setSuccess(true);
      return;
    }
  };

  return (
    <div>
      <h3>Create Episode</h3>

      {success && (
        <Redirect
          to={{
            pathname: `/create/${episode.uuid}`,
            state: { episode: episode }
          }}
        />
      )}

      <div>
        {error ? `there was an error creating your epidose: ${error}` : ''}
      </div>

      <div>
        <div>Episode Title</div>
        <input value={title} onChange={handleTitle} />
      </div>

      <div>
        <div>Episode Description</div>
        <input value={description} onChange={handleDescription} />
      </div>

      <div>
        <button onClick={submitEpisode}>Next</button>
      </div>
    </div>
  );
}

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [answer, setAnswer] = useState(false);
  const [correctedAnswer, setCorrectedAnswer] = useState('');
  const [showSelection, setShowSelection] = useState(false);
  const [error, setError] = useState('');
  const [userIp, setUserIp] = useState('');
  const [score, setScore] = useState(0);
  let { id } = useParams();

  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await fetch(
        `https://verrc13mxk.execute-api.us-west-2.amazonaws.com/dev/episodes/${id}/questions`
      );

      if (response.error) {
        setError(
          'Sorry, we are experiencing technical difficulties at the moment...'
        );
        return;
      }

      const body = await response.json();
      if (body.message === 'Success') {
        setQuestions(body.data);
        setCurrentQuestion(body.data[0]);
        setShowSelection(true);
      }
    };

    const fetchIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const body = await response.json();
        console.log(body);
        setUserIp(body.ip);
      } catch (e) {
        console.log(e);
      }
    };

    fetchQuestions();
    fetchIP();
  }, []);

  const selectAnswer = e => {
    setAnswer(e.target.value);
  };

  useEffect(() => {
    if (questions.length) {
      const timer = setTimeout(() => {
        console.log('Answer timeout', questions[0]);
        setCurrentQuestion(questions[0]);
        setShowSelection(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [correctedAnswer]);

  const submitAnswer = async () => {
    setShowSelection(false);
    const response = await fetch(
      `https://verrc13mxk.execute-api.us-west-2.amazonaws.com/dev/question/${currentQuestion.uuid}/check`,
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          episodeId: id,
          answer: answer,
          user: userIp
        })
      }
    );

    if (response.error) {
      setError(response.error);
      return;
    }

    const body = await response.json();
    if (body.message === 'Success') {
      console.log(body);

      setCorrectedAnswer(body.data.result ? 'Correct!' : 'Wrong!');
      questions.splice(0, 1);
      setQuestions(questions);
      setScore(body.data.score);
      return;
    }
  };

  return (
    <div>
      <h3>ID: {id}</h3>
      <div>{error}</div>

      <div>
        {currentQuestion ? (
          <>
            <h1>{currentQuestion.question}</h1>

            {showSelection ? (
              <>
                <h3>Your Answer:</h3>
                <select value={answer} onChange={selectAnswer}>
                  <option value={true}>True</option>
                  <option value={false}>False</option>
                </select>
                <button onClick={submitAnswer}>Submit Answer!</button>
              </>
            ) : (
              correctedAnswer
            )}
          </>
        ) : (
          <div>Your score: {score}</div>
        )}
      </div>
    </div>
  );
}
