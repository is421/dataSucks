import com.saucelabs.common.SauceOnDemandAuthentication;
import com.saucelabs.common.SauceOnDemandSessionIdProvider;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestName;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.*;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.URL;

import static org.junit.Assert.assertEquals;

/**
 * Simple {@link RemoteWebDriver} test that demonstrates how to run your Selenium tests with <a href="http://saucelabs.com/ondemand">Sauce OnDemand</a>.
 * *
 * @author Ross Rowe
 */
public class WebDriverTest {

    private WebDriver driver;

    @Before
    public void setUp() throws Exception {

        DesiredCapabilities capabilities = DesiredCapabilities.firefox();
        capabilities.setCapability("version", "17");
        capabilities.setCapability("platform", Platform.XP);
        this.driver = new RemoteWebDriver(
                new URL("http://harirao3:6d0e18c6-2733-4fcf-a010-f71a4f8e1a28@ondemand.saucelabs.com:80/wd/hub"),
                capabilities);
    }

    @Test
    public void webDriver() throws Exception {
        String baseUrl="http://puppet.srihari.guru:80";
        driver.get(baseUrl+ "/dashboard");
        
        
        
        
        WebElement username = driver.findElement(By.cssSelector("input[name=\"username\"]"));
        WebElement password = driver.findElement(By.cssSelector("input[name=\"password\"]"));
        WebElement loginbtn  = driver.findElement(By.cssSelector("input[value=\"Signin\"]"));
        username.sendKeys("datasucksalot@gmail.com");
        password.sendKeys("fucktheData");
        loginbtn.click();
        WebElement fbBtn = driver.findElement(By.cssSelector("a[href=\"/auth/facebook\"]"));
        
        fbBtn.click();
        
            }

    @After
    public void tearDown() throws Exception {
        driver.quit();
    }

}
