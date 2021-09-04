import { Avatar, Box, Flex, Text } from "@chakra-ui/react";

interface ProfileProps {
  showProfileData: boolean;
}

export function Profile({ showProfileData = true }: ProfileProps) {

  return (
    <Flex align="center">
      {showProfileData && (
        <Box mr='4' textAlign='right'>
          <Text>Allan David de Oliveira</Text>
          <Text color="gray.300" fontSize="small">allan.j.k15@gmail.com</Text>
        </Box>
      )}

      <Avatar size='md' name='Allan David de Oliveira' src='https://github.com/allandav1d.png' />
    </Flex>
  )
}