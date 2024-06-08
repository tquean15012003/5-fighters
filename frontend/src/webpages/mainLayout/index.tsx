import { Box, Grid, Spacer } from '@chakra-ui/react'
import React, { PropsWithChildren } from 'react'

import MainLayoutContent from './MainLayoutContent'
import { MainLayoutProvider } from './MainLayoutProvider'
import useMainLayout from './hooks/useMainLayout'

const MainLayoutComponent: React.FC<PropsWithChildren & { footerHeight?: number | string }> = ({
    children,
}) => {
    const { actionsHeight, navbarHeight } = useMainLayout()

    return (
        <Grid gridTemplateRows="auto 1fr" gridTemplateColumns="1fr" minH="100dvh" maxH="100dvh">
            <Grid
                w="full"
                h={`calc(100dvh - ${navbarHeight}px)`}
                gridTemplateRows={actionsHeight ? `100% auto auto` : '100% auto'}
                as="main"
            >
                {children}
                <Box />
                {actionsHeight ? <Spacer h={`${actionsHeight}px`} /> : null}
            </Grid>
        </Grid>
    )
}

const MainLayout: React.FC<PropsWithChildren & { footerHeight?: number | string }> = ({
    children,
    footerHeight,
}) => {
    return (
        <MainLayoutProvider>
            <MainLayoutComponent footerHeight={footerHeight}>{children}</MainLayoutComponent>
        </MainLayoutProvider>
    )
}

export default MainLayout

export { MainLayoutContent }
