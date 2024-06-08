import { ThemeConfig, extendTheme } from '@chakra-ui/react'

import { buttonTheme } from './componentProps/button'
import { headingTheme } from './componentProps/heading'
import { getChakraColorScale } from './utils'

const config: ThemeConfig = {
    initialColorMode: 'light',
    useSystemColorMode: false,
}

const styles = {
    global: {
        html: {
            scrollBehavior: 'smooth',
            overscrollBehavior: 'none',
            WebkitTapHighlightColor: 'rgba(255, 255, 255, 0)',
        },
        body: {
            overscrollBehavior: 'none',
            backgroundColor: 'brand.bg',
        },
        ':where(pre, code, kbd,samp)': {
            fontFamily: 'ApercuPro Mono, monospace',
            letterSpacing: '-0.05em',
        },
        ':where(pre)': {
            background: '#0d1117',
            color: 'white',
            borderRadius: 'lg',
            px: 4,
            py: 3,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            width: '100%',
        },
    },
}

// TODO: Setup base theme
const theme = extendTheme({
    config,
    styles,
    fonts: {
        heading: 'ApercuPro, sans-serif',
        body: 'ApercuPro, sans-serif',
    },
    components: {
        Button: buttonTheme,
        Heading: headingTheme,
        Container: {
            baseStyle: {
                maxW: 'container.sm',
            },
        },
    },
    colors: {
        brand: {
            purple: getChakraColorScale('#8223D2'),
            orange: getChakraColorScale('#FAA546'),
            teal: getChakraColorScale('#6EFAC3'),
            blue: getChakraColorScale('#647DE1'),
            bg: '#151719',
        },
    },
})

export default theme
