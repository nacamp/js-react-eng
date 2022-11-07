import React, { useEffect, useState, useRef } from 'react';
import { Box, Button, TextField, Paper, Typography, Chip, Avatar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import copy from 'copy-to-clipboard';

function Question({ idx, kr, en, onChange }: any) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [hints, setHints] = useState<string[]>([]);
  const [hintStep, setHintStep] = useState<number>(0);
  const [text, setText] = useState('');
  const [hint, setHint] = useState<string>('');

  useEffect(() => {
    if (en) {
      setHintStep(0);
      setText('');
      setHints(en.split(' '));
      setHint('');
    }
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
          flexDirection: `${isMobile ? 'column' : 'row'}`,
          justifyContent: 'center',
          mt: 2,
          mx: isMobile ? 2 : 0,
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
          sx={isMobile ? { mr: 5 } : { mr: 2 }}
          required
        />
        {isMobile && <Box sx={{ mt: 2 }} />}
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
          flexDirection: `${isMobile ? 'column' : 'row'}`,
          justifyContent: 'space-between',
          mx: isMobile ? 2 : 0,
          // p: 1,
          // m: 1,
        }}
      >
        {isMobile && <Box sx={{ mt: 2 }} />}
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
          sx={isMobile ? { mr: 5 } : { mr: 2 }}
          required
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexBasis: '100%',
            verticalAlign: 'bottom',
          }}
        >
          <Button sx={{ mt: 2 }} onClick={(e) => handleNextHint()}>
            Hint
          </Button>
          <Button sx={{ mt: 2 }} onClick={(e) => handleAllHint()}>
            All hint
          </Button>
          <Button sx={{ mt: 2 }} onClick={(e) => handleClearHint()}>
            Clear
          </Button>
        </Box>
      </Box>
    </>
  );
}

function Main() {
  const scrollBoxRef = useRef<HTMLUListElement>();
  const [data, setData] = useState<any>([]);
  const getData = () => {
    fetch('data.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (myJson) {
        setData(myJson);
      });
  };

  // 내가 공부한 자료
  const [studiedData, setStudiedData] = useState<any>({});
  useEffect(() => {
    getData();
    setStudiedData(JSON.parse(localStorage.getItem('eng') || '{}'));
  }, []);

  const [text, setText] = useState('');
  function handleChange(text: string) {
    setText(text);
  }

  const [line, setLine] = useState<number>(0);
  const [prevData, setPrevData] = useState<any>([]);
  function handleNext() {
    const nextLine = line + 1;
    setLine(nextLine);
    setPrevData(data.slice(0, nextLine));
    if (text === '') {
      return;
    }

    const answer: { [key: number]: string } = {};
    answer[line] = text;
    const answerList = { ...studiedData, ...answer };
    setStudiedData(answerList);
    localStorage.setItem('eng', JSON.stringify(answerList));
    setText('');
  }

  function handleCopy() {
    copy(localStorage.getItem('eng') || '{}');
  }

  const scrollToBottom = () => {
    if (scrollBoxRef.current) {
      scrollBoxRef.current.scrollTop = scrollBoxRef.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [prevData]);

  // 공부했던 가장 마지막 라인
  const [studiedMaxLine, setStudiedMaxLine] = useState<number>(0);
  useEffect(() => {
    try {
      setStudiedMaxLine(+Object.keys(studiedData).reduce((a, b) => (+a > +b ? a : b)));
    } catch {}
  }, [studiedData]);

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ pl: 1 }}>
        <Box
          ref={scrollBoxRef}
          style={{
            display: 'block',
            width: '100%',
            overflow: 'auto',
            height: '500px',
          }}
        >
          {prevData &&
            prevData.length > 0 &&
            prevData.map((item: any, i: number) => (
              <Typography key={i} variant="body2" gutterBottom>
                {item.idx}: {item.en}-{item.kr} <br />
                My answer : {studiedData[i]}
              </Typography>
            ))}
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
            setPrevData(data.slice(0, +event.target.value));
            setLine(+event.target.value);
          }}
        />
        <Chip avatar={<Avatar>{studiedMaxLine}</Avatar>} label="studied" />
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
