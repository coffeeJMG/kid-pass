"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  SegmentedControl,
  Stack,
  Title,
  Group,
  Paper,
  Flex,
} from "@mantine/core";
import { BarChart, LineChart } from "@mantine/charts";
import useAuth from "@/hook/useAuth";
import dayjs from "dayjs";

// 그래프 타입 정의
const GRAPH_TYPES = [
  { value: "GROWTH", label: "성장" },
  { value: "FEEDING", label: "수유" },
  { value: "SLEEP", label: "수면" },
];

// 기간 옵션
const PERIOD_OPTIONS = [
  { value: "month", label: "1개월" },
  { value: "quarter", label: "3개월" },
  { value: "year", label: "1년" },
];

const RecordGraph = () => {
  const [graphType, setGraphType] = useState<string>("GROWTH");
  const [period, setPeriod] = useState<string>("quarter");
  const [graphData, setGraphData] = useState<any>({});
  const { getToken } = useAuth();

  // 그래프 데이터 fetching
  const fetchGraphData = async () => {
    try {
      const token = await getToken();
      const currentKid = localStorage.getItem("currentKid");

      if (!currentKid) {
        console.error("No child selected");
        return;
      }

      const response = await fetch(
        `/api/graph?childId=${currentKid}&type=${graphType}&period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();

        // 날짜 포맷팅 로직
        const formattedData = Object.keys(result.data).reduce(
          (acc: any, key) => {
            acc[key] = result.data[key].map((item: any) => ({
              ...item,
              date: dayjs(item.date).format("M.D"),
            }));
            return acc;
          },
          {}
        );

        setGraphData(formattedData);
      }
    } catch (error) {
      console.error("Graph data fetch error:", error);
    }
  };

  // 데이터 변경 시 다시 fetching
  useEffect(() => {
    fetchGraphData();
  }, [graphType, period]);

  // 그래프 렌더링 함수
  const renderGraph = () => {
    switch (graphType) {
      case "GROWTH":
        return (
          <Stack gap="md">
            {/* 몸무게 그래프 */}
            <Paper withBorder p="md" radius="md">
              <Title order={5} mb="md">
                몸무게 변화
              </Title>
              <LineChart
                h={300}
                data={graphData.weight || []}
                dataKey="date"
                series={[
                  { name: "value", color: "blue.6", label: "몸무게 (kg)" },
                ]}
                tickLine="y"
                gridAxis="x"
                valueFormatter={(value) => `${value} kg`}
                withYAxis={false}
              />
            </Paper>

            {/* 키 그래프 */}
            <Paper withBorder p="md" radius="md">
              <Title order={5} mb="md">
                키 변화
              </Title>
              <LineChart
                h={300}
                data={graphData.height || []}
                dataKey="date"
                series={[{ name: "value", color: "green.6", label: "키 (cm)" }]}
                tickLine="y"
                gridAxis="x"
                valueFormatter={(value) => `${value} cm`}
                withYAxis={false}
              />
            </Paper>
          </Stack>
        );

      case "FEEDING":
        return (
          <Stack gap="md">
            {/* 총 수유량 그래프 */}
            <Paper withBorder p="md" radius="md">
              <Title order={5} mb="md">
                총 수유량
              </Title>
              <BarChart
                h={300}
                data={graphData.total || []}
                dataKey="date"
                series={[
                  { name: "amount", color: "blue.6", label: "총 수유량 (ml)" },
                  { name: "count", color: "green.6", label: "수유 횟수" },
                ]}
                tickLine="y"
                gridAxis="x"
                withYAxis={false}
                valueFormatter={(value) => `${value}`}
              />
            </Paper>

            {/* 모유/분유 비교 그래프 */}
            <Paper withBorder p="md" radius="md">
              <Title order={5} mb="md">
                모유 vs 분유
              </Title>
              <BarChart
                h={300}
                data={graphData.milk || []}
                dataKey="date"
                series={[
                  {
                    name: "amount",
                    color: "blue.6",
                    label: "모유 수유량 (ml)",
                  },
                  {
                    name: "amount",
                    color: "green.6",
                    label: "분유 수유량 (ml)",
                  },
                ]}
                type="stacked"
                tickLine="y"
                gridAxis="x"
                valueFormatter={(value) => `${value}`}
                withYAxis={false}
              />
            </Paper>
          </Stack>
        );

      case "SLEEP":
        return (
          <Stack gap="md">
            {/* 총 수면 시간 그래프 */}
            <Paper withBorder p="md" radius="md">
              <Title order={5} mb="md">
                총 수면 시간
              </Title>
              <BarChart
                h={300}
                data={graphData.total || []}
                dataKey="date"
                series={[
                  {
                    name: "sleepTime",
                    color: "blue.6",
                    label: "총 수면 시간 (분)",
                  },
                ]}
                tickLine="y"
                gridAxis="x"
                valueFormatter={(value) => `${value} 분`}
                withYAxis={false}
              />
            </Paper>

            {/* 낮잠/밤잠 비교 그래프 */}
            <Paper withBorder p="md" radius="md">
              <Title order={5} mb="md">
                낮잠 vs 밤잠
              </Title>
              <BarChart
                h={300}
                data={graphData.total || []}
                dataKey="date"
                series={[
                  { name: "dayTimeSleep", color: "blue.6", label: "낮잠" },
                  { name: "nightTimeSleep", color: "green.6", label: "밤잠" },
                ]}
                type="stacked"
                tickLine="y"
                gridAxis="x"
                valueFormatter={(value) => `${value} 분`}
                withYAxis={false}
              />
            </Paper>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Stack gap="xs">
      <Flex justify="space-between">
        {/* 그래프 타입 선택 */}
        <Box></Box>
        <Group justify="center">
          <SegmentedControl
            value={graphType}
            onChange={setGraphType}
            data={GRAPH_TYPES}
            size="md"
          />
        </Group>

        {/* 기간 선택 */}
        {/* <Group justify="center">
          <SegmentedControl
            value={period}
            onChange={setPeriod}
            data={PERIOD_OPTIONS}
            size="md"
          />
        </Group> */}
      </Flex>

      {/* 그래프 렌더링 */}
      {renderGraph()}
    </Stack>
  );
};

export default RecordGraph;
