import { Flex, SimpleGrid, Box, Text, theme, Button, Icon } from "@chakra-ui/react";
import dynamic from 'next/dynamic';
import React, { useContext, useEffect } from "react";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { AuthContext } from "../contexts/AuthContext";
import { apiAuth } from "../services/apiClient";
import { setupAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";
import { useCan } from "../services/hooks/useCan";
import { Can } from "../components/Can";

import { GiExitDoor } from 'react-icons/gi'

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

const options = {
  chart: {
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    },
    foreColor: theme.colors.gray[500],
  },
  grid: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    enabled: false
  },
  xaxis: {
    type: 'datetime',
    axisBorder: {
      color: theme.colors.gray[600],
    },
    axisTicks: {
      color: theme.colors.gray[600],
    },
    categories: [
      '2021-03-18T00:00:00.000Z',
      '2021-03-19T00:00:00.000Z',
      '2021-03-20T00:00:00.000Z',
      '2021-03-21T00:00:00.000Z',
      '2021-03-22T00:00:00.000Z',
      '2021-03-23T00:00:00.000Z',
      '2021-03-24T00:00:00.000Z',
    ]
  },
  fill: {
    opacity: 0.3,
    type: 'gradient',
    gradient: {
      shade: 'dark',
      opacityFrom: 0.7,
      opacityTo: 0.3,

    }
  }
}
const series = [
  {
    name: 'series 1',
    data: [31, 120, 10, 28, 61, 10, 109]
  }
]

export default function Dashboard() {
  const { user, signOut } = useContext(AuthContext)

  const userCanSeeMetrics = useCan({
    permissions: ['metrics.list']
  })

  useEffect(() => {
    apiAuth.get('/me')
      .then((response) => { console.log(response) })
      .catch((error) => { console.log(error) })
  })

  return (
    <Flex direction='column' h='100vh'>
      <Header />

      <Flex w='100%' my='6' maxWidth={1480} mx='auto' px='6'>
        <Sidebar />

        <SimpleGrid flex='1' gap='4' minChildWidth='320px' align='flex-start'>

          <Box p={['6', '8']} bg="gray.800" borderRadius={8} pb='4'>
            <Text fontSize="lg" mb='4'>Dash:{user?.email}</Text>
            <Can permissions={['metrics.list']}>
              <Text fontSize="lg" mb='4'>Autorizado a ver as metricas</Text>
            </Can>

            <Button
              as='a'
              size='sm'
              fontSize='sm'
              colorScheme='pink'
              onClick={signOut}
              leftIcon={<Icon as={GiExitDoor} fontSize='20' />}
            >
              Sair
            </Button>

          </Box>

          <Box p={['6', '8']} bg="gray.800" borderRadius={8} pb='4'>
            <Text fontSize="lg" mb='4'>Inscritos da semana</Text>
            <Chart type="area" height={160} options={options} series={series} />
          </Box>
          <Box p={['6', '8']} bg="gray.800" borderRadius={8} pb='4'>
            <Text fontSize="lg" mb='4'>Taxa de abertura</Text>
            <Chart type="area" height={160} options={options} series={series} />
          </Box>


        </SimpleGrid>

      </Flex>

    </Flex>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)
  const response = await apiClient.get('/me')

  return {
    props: {}
  }
})