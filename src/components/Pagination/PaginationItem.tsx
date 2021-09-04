import { Button } from "@chakra-ui/button";

interface PaginationItemProps {
  number: number;
  isCurrent?: boolean;
}

export function PaginationItem({ number, isCurrent = false }: PaginationItemProps) {
  if (isCurrent) {
    return (
      <Button
        size='sm'
        fontSize='xs'
        w='4'
        colorScheme='pink'
        disabled
        _disabled={{
          bgColor: 'pink.500',
          cursor: 'default'
        }}
      >
        {number}
      </Button>
    )
  }


  return (
    <Button
      size='sm'
      fontSize='xs'
      w='4'
      bgColor='gray.700'
      _hover={{ bgColor: 'gray.500' }}
    >
      {number}
    </Button>
  )
}