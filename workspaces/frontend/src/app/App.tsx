import React, { useEffect } from 'react';
import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/react-core/dist/styles/base.css';
import './app.css';
import {
  Brand,
  Flex,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadLogo,
  MastheadMain,
  MastheadToggle,
  Page,
  PageSidebar,
  PageToggleButton,
  Title,
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons';
import ErrorBoundary from '~/app/error/ErrorBoundary';
import NamespaceSelector from '~/shared/components/NamespaceSelector';
import logoDarkTheme from '~/images/logo-dark-theme.svg';
import { NamespaceContextProvider } from './context/NamespaceContextProvider';
import AppRoutes from './AppRoutes';
import NavSidebar from './NavSidebar';
import { NotebookContextProvider } from './context/NotebookContext';
import { isMUITheme, Theme } from './const';
import { BrowserStorageContextProvider } from './context/BrowserStorageContext';

const isStandalone = process.env.PRODUCTION !== 'true';

const App: React.FC = () => {
  useEffect(() => {
    // Apply the theme based on the value of STYLE_THEME
    if (isMUITheme()) {
      document.documentElement.classList.add(Theme.MUI);
    } else {
      document.documentElement.classList.remove(Theme.MUI);
    }
  }, []);

  const masthead = (
    <Masthead>
      <MastheadMain>
        <MastheadToggle>
          <PageToggleButton id="page-nav-toggle" variant="plain" aria-label="Dashboard navigation">
            <BarsIcon />
          </PageToggleButton>
        </MastheadToggle>
        {!isMUITheme() && (
          <MastheadBrand>
            <MastheadLogo component="a">
              <Brand src={logoDarkTheme} alt="Kubeflow" heights={{ default: '36px' }} />
            </MastheadLogo>
          </MastheadBrand>
        )}
      </MastheadMain>
      <MastheadContent>
        <Flex>
          <Title headingLevel="h2" size="3xl">
            Kubeflow Notebooks 2.0
          </Title>
          <NamespaceSelector />
        </Flex>
      </MastheadContent>
    </Masthead>
  );
  const sidebar = <PageSidebar isSidebarOpen={false} />;

  return (
    <ErrorBoundary>
      <NotebookContextProvider>
        <BrowserStorageContextProvider>
          <NamespaceContextProvider>
            <Page
              mainContainerId="primary-app-container"
              masthead={isStandalone ? masthead : ''}
              isContentFilled
              sidebar={isStandalone ? <NavSidebar /> : sidebar}
              isManagedSidebar={isStandalone}
              className={isStandalone ? '' : 'embedded'}
            >
              <AppRoutes />
            </Page>
          </NamespaceContextProvider>
        </BrowserStorageContextProvider>
      </NotebookContextProvider>
    </ErrorBoundary>
  );
};

export default App;
