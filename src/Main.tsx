import React, { useEffect, useState, useRef } from 'react';
import { Box, Button, TextField, Paper, Typography, Chip, Avatar } from '@mui/material';
import copy from 'copy-to-clipboard';

function Question({ idx, kr, en, onChange }: any) {
  const [hints, setHints] = useState<string[]>([]);
  const [hintStep, setHintStep] = useState<number>(0);
  const [text, setText] = useState('');
  const [hint, setHint] = useState<string>('');

  useEffect(() => {
    setHintStep(0);
    setText('');
    setHints(en.split(' '));
    setHint('');
  }, [en]);

  function handleChange(text: string) {
    localStorage.setItem(idx, text);
    setText(text);
    onChange(text);
  }

  function handleNextHint() {
    let temp = '';
    setHintStep(hintStep + 1);
    for (let i = 0; i < Math.min(hintStep + 1, hints.length); i++) {
      temp += hints[i] + ' ';
    }
    setHint(temp);
  }

  function handleAllHint() {
    setHint(en);
    setHintStep(0);
  }

  function handleClearHint() {
    setHint('');
    setHintStep(0);
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          mt: 2,
        }}
      >
        <TextField
          fullWidth
          multiline
          label="한글"
          value={kr}
          variant="outlined"
          InputProps={{
            readOnly: true,
          }}
          sx={{ mr: 2 }}
          required
        />
        <TextField
          fullWidth
          multiline
          label="영어"
          value={' ' + hint}
          variant="outlined"
          InputProps={{
            readOnly: true,
          }}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          p: 1,
          m: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            p: 1,
            m: 1,
            flexBasis: '100%',
          }}
        >
          <Button onClick={(e) => handleNextHint()}>Hint</Button>
          <Button onClick={(e) => handleAllHint()}>All hint</Button>
          <Button onClick={(e) => handleClearHint()}>Clear</Button>
        </Box>
        <TextField
          fullWidth
          multiline
          label="답변"
          value={text}
          variant="standard"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setText(event.target.value);
            handleChange(event.target.value);
          }}
          sx={{ ml: 2 }}
          required
        />
      </Box>
    </>
  );
}

function Main() {
  const messageBoxRef = useRef<HTMLUListElement>();
  const [data, setData] = useState<any>([]);
  const getData = () => {
    fetch('data.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        //console.log(response);
        return response.json();
      })
      .then(function (myJson) {
        //console.log(myJson);
        setData(myJson);
      });
  };
  const [studiedData, setStudiedData] = useState<any>({});
  useEffect(() => {
    getData();

    setStudiedData(JSON.parse(localStorage.getItem('eng') || '{}'));
  }, []);

  const [line, setLine] = useState<number>(0);
  const [prevData, setPrevData] = useState<any>([]);

  const [text, setText] = useState('');

  function handleChange(text: string) {
    setText(text);
  }

  function handleNext() {
    const nextLine = line + 1;
    setLine(nextLine);
    setPrevData(data.slice(0, nextLine));
    if (text === '') {
      return;
    }

    // console.log(data.slice(0,line+1))
    const answer: { [key: number]: string } = {};
    answer[line] = text;
    const answerList = { ...studiedData, ...answer };
    setStudiedData(answerList);
    // console.log(studiedData, { nextLine: nextLine});
    localStorage.setItem('eng', JSON.stringify(answerList));
    // JSON.parse(localStorage.getItem('nums'))
    setText('');
    handleStudiedLine();
  }

  function handleCopy() {
    // console.log(JSON.parse(localStorage.getItem('eng')|| '{}'))
    // console.log( localStorage.getItem('eng')|| '{}')
    copy(localStorage.getItem('eng') || '{}');
  }

  const [studiedLine, setStudiedLine] = useState<number>(0);
  function handleStudiedLine() {
    // console.log(studiedData);
    // setStudiedLine(+Object.keys(studiedData).reduce((a, b) => (+a > +b ? a : b)));
  }

  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [prevData]);

  useEffect(() => {
    try {
      setStudiedLine(+Object.keys(studiedData).reduce((a, b) => (+a > +b ? a : b)));
    } catch {}
  }, [studiedData]);

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ pl: 1 }}>
        <Box
          ref={messageBoxRef}
          style={{
            display: 'block',
            width: '100%',
            overflow: 'auto',
            height: '500px',
          }}
        >
          <Typography variant="body2" gutterBottom>
            {prevData &&
              prevData.length > 0 &&
              prevData.map((item: any, i: number) => (
                <>
                  <p>
                    {' '}
                    {item.idx}: {item.en}-{item.kr}
                  </p>
                  <p> My answer : {studiedData[i]}</p>
                </>
              ))}
          </Typography>
        </Box>
      </Paper>

      {/* current line, 완료된 라인 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          p: 1,
          m: 1,
        }}
      >
        <TextField
          label="line"
          value={line}
          variant="standard"
          sx={{ mr: 2 }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setLine(+event.target.value);
            setPrevData(data.slice(0, +event.target.value));
            handleStudiedLine();
            //handleLine(event.target.value);
          }}
        />
        <Chip avatar={<Avatar>{studiedLine}</Avatar>} label="studied" onClick={(e) => handleStudiedLine()} />
        <Chip label="copy" onClick={(e) => handleCopy()} />
        <Chip label="next" onClick={(e) => handleNext()} />
      </Box>
      {data && data.length > 0 && (
        <Question idx={data[line]?.idx} en={data[line]?.en} kr={data[line]?.kr} onChange={handleChange} />
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          p: 1,
          m: 1,
        }}
      ></Box>
    </Box>
  );
}
/*
https://blog.qvil.dev/react/react-scroll-to-bottom-with-messages-effect
https://stackoverflow.com/questions/72036806/map-through-two-arrays-react
*/

export default Main;
