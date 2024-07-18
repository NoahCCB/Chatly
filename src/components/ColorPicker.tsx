import { Button, Center, Input, Menu, MenuButton, MenuList, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Select, SimpleGrid } from "@chakra-ui/react";


const ColorPicker = ({color, setColor}: any) => {

    const colors = ['#8edafa', '#debfff', '#fcfc92',
    '#fcb995', '#fc9595', '#95fc95'];

    return (
        <Menu>
            <MenuButton
            background={color}
            h={30}
            w={"full"}
            padding={0}
            minWidth="unset"
            borderRadius="lg"
            color="black"
            fontWeight="bold"
            >Color</MenuButton>
            <MenuList p={5}>
                <SimpleGrid columns={5} spacing={2}>
                    {colors.map((c) => (
                    <Button
                        key={c}
                        aria-label={c}
                        background={c}
                        h="22px"
                        w="22px"
                        padding={0}
                        minWidth="unset"
                        borderRadius={3}
                        _hover={{ background: c }}
                        onClick={() => {
                        setColor(c);
                        }}
                    ></Button>
                    ))}
                </SimpleGrid>
            </MenuList>
        </Menu>
    );
}

export default ColorPicker;