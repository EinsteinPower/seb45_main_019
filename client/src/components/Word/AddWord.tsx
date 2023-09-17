import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../common/utils/api';
import { useAppSelector } from '../../redux/hooks';
import { AxiosError } from 'axios';

export default function AddWord(props: { wordId: number }) {
  const queryClient = useQueryClient();
  const user = useAppSelector((state) => state.user);
  const queryKey = ['userWordIds', user.userId];

  const { isLoading, error, data } = useQuery({
    queryKey: queryKey,
    queryFn: () =>
      api(`/words/members/${user.userId}`).then(({ data }) => {
        // console.log(data);
        return data;
      })
  });

  const [wordInWords, setWordInWords] = useState(false);
  useEffect(() => {
    // console.log(user.memberStatus, data, data ? data.data : '');

    if (user.memberStatus && data && data.data)
      data.data.includes(props.wordId)
        ? setWordInWords(true)
        : setWordInWords(false);
  }, [data]);

  const addToMyWords = useMutation(
    () =>
      api(`/words/members/${user.userId}`, 'post', {
        wordId: props.wordId
      }).then(({ data }) => {
        // console.log(data);
        // alert('단어장에 추가되었습니다.');
      }),
    {
      onSuccess: () => queryClient.invalidateQueries(queryKey)
    }
  );

  const deleteFromMyWords = useMutation(
    () =>
      api(`/words/members/${user.userId}`, 'delete', {
        wordId: props.wordId
      }).then((res) => {
        // console.log(res.data)
        //
      }),
    {
      onSuccess: () => queryClient.invalidateQueries(queryKey)
    }
  );

  const handeClick = () => {
    if (user.memberStatus)
      if (wordInWords) {
        deleteFromMyWords.mutate();
      } else {
        addToMyWords.mutate();
      }
    else alert('로그인 후 이용하실 수 있습니다.');
  };

  if (isLoading) return <div> 로딩중... </div>;

  if (error) {
    const myError = error as AxiosError;
    console.log(error);

    return <div> 에러: {myError.message} </div>;
  }
  return (
    <Box sx={{}}>
      <Button
        variant={wordInWords ? 'outlined' : 'contained'}
        onClick={handeClick}
      >
        {wordInWords ? '단어장 해제' : '단어장 추가'}
      </Button>
    </Box>
  );
}
