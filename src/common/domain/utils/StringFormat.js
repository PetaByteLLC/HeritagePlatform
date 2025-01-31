export const format = (template, ...values) => {
    return template.replace(/%s/g, () => values.shift());
}