function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Fitbit Account</Text>}>
        <Oauth
          settingsKey="oauth"
          title="Login"
          label="Fitbit"
          status="Login"
          authorizeUrl="https://www.fitbit.com/oauth2/authorize"
          requestTokenUrl="https://api.fitbit.com/oauth2/token"
          clientId="23B9KC"
          clientSecret="24a4db0e70aa661ab7f7520de483de30"
          scope="sleep"
          onAccessToken={(data) => {
            console.log(JSON.stringify(data));
          }}
        />
      </Section>
      <Section
        title={<Text bold align="center">Habits</Text>}>
        
        <AdditiveList 
          settingsKey="habit-list"
          />
      </Section>
    </Page>
    
  );
}

registerSettingsPage(mySettings);