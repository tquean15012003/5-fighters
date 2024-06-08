import { Container, ContainerProps, SlideFade } from '@chakra-ui/react'
import React from 'react'

const MainLayoutContent: React.FC<ContainerProps & { animate?: boolean }> = ({
    children,
    animate = true,
    ...props
}) => (
    <SlideFade in={animate}>
        <Container {...props}>
            {children}
        </Container>
    </SlideFade>
)

export default MainLayoutContent
