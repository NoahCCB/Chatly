import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, VStack } from "@chakra-ui/react";
import SuggestionForm from "./SuggestionForm";
import SuggestionList from "./SuggestionList";


const SuggestionDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {

    return (
        <Drawer isOpen={isOpen} size={"lg"} onClose={onClose} placement="right">
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>Suggestions</DrawerHeader>
                <DrawerBody>
                    <VStack spacing={8}>
                        <SuggestionList />
                        <SuggestionForm />
                    </VStack>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    )
}

export default SuggestionDrawer;